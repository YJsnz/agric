import json
import tempfile
import unittest
import threading
from datetime import datetime, timezone, timedelta
from pathlib import Path
from gateway import Gateway
from simulator import Firmware
from protocol import *

def expires(): return (datetime.now(timezone.utc)+timedelta(seconds=60)).isoformat()


class Port:
    def __init__(self): self.incoming = b''; self.outgoing = []
    def read(self, size): data=self.incoming;self.incoming=b'';return data
    def write(self, packet): self.outgoing.append(packet);return len(packet)
    def flush(self): pass


class GatewayTests(unittest.TestCase):
    def setUp(self):
        self.directory=tempfile.TemporaryDirectory();self.port=Port()
        self.gateway=Gateway({'devices':[{'address':1,'entityId':'yt-weather'}]},self.port,str(Path(self.directory.name)/'spool.db'))
    def tearDown(self): self.gateway.db.close();self.directory.cleanup()
    def test_durable_uplink_and_offline_retry(self):
        packet=encode(Frame(1,TELEMETRY,5,{'messageId':'boot_5','measuredAt':'2026-10-15T00:00:00Z','readings':[{'metric':'temperature','value':24}]}))
        self.port.incoming=packet;self.gateway.receive()
        self.assertEqual(self.gateway.db.execute('SELECT COUNT(*) FROM uplink').fetchone()[0],1)
        self.assertEqual(Decoder().feed(self.port.outgoing[0])[0].payload['scope'],'gateway_durable')
        self.gateway.api=lambda *args: (_ for _ in ()).throw(OSError('offline'))
        self.gateway.flush();self.assertEqual(self.gateway.db.execute('SELECT COUNT(*) FROM uplink').fetchone()[0],1)
        delivered=[];self.gateway.api=lambda *args:delivered.append(args)
        self.gateway.flush();self.assertEqual(len(delivered),1)
        self.assertEqual(self.gateway.db.execute('SELECT COUNT(*) FROM uplink').fetchone()[0],0)
    def test_serial_command_retry_is_bounded(self):
        self.gateway.config.update({'api':'http://localhost','farm':'yantian-01'})
        self.gateway.api=lambda *args:[{'id':23,'expiresAt':expires(),'payload':json.dumps({'action':'SAMPLE','value':0,'durationSeconds':0})}]
        self.gateway.poll()
        for _ in range(4):
            self.gateway.db.execute('UPDATE sent SET retry=0');self.gateway.retry()
        self.assertEqual(len(self.port.outgoing),3)
        payload=json.loads(self.gateway.db.execute('SELECT payload FROM uplink').fetchone()[0]);self.assertFalse(payload['success'])
    def test_firmware_deduplicates_across_restart(self):
        path=Path(self.directory.name)/'firmware.json';firmware=Firmware(1,path)
        command=Frame(1,COMMAND,123,{'action':'SET_ENABLED','value':1,'durationSeconds':10})
        self.assertTrue(firmware.command(command).payload['success'])
        self.assertTrue(Firmware(1,path).command(command).payload['success'])
        self.assertEqual(len(json.loads(path.read_text())['receipts']),1)

    def test_duplicate_telemetry_is_cached_once_and_conflicts_not_acked(self):
        payload={'messageId':'boot_7','measuredAt':'2026-10-15T00:00:00Z','readings':[]}
        packet=encode(Frame(1,TELEMETRY,7,payload))
        self.port.incoming=packet+packet;self.gateway.receive()
        self.assertEqual(self.gateway.db.execute('SELECT count(*) FROM uplink').fetchone()[0],1)
        self.assertEqual(len(self.port.outgoing),2)
        self.port.incoming=encode(Frame(1,TELEMETRY,7,{**payload,'readings':[{'metric':'temperature','value':30}]}))
        self.gateway.receive();self.assertEqual(len(self.port.outgoing),2)

    def test_receipt_waiting_for_upload_prevents_command_resend(self):
        self.gateway.api=lambda *args:[{'id':23,'expiresAt':expires(),'payload':json.dumps({'action':'SAMPLE'})}]
        self.gateway.poll();self.gateway.retry()
        self.port.incoming=encode(Frame(1,ACK,23,{'success':True}))
        self.gateway.receive();self.gateway.poll();self.gateway.retry()
        self.assertEqual(len(self.port.outgoing),1)
        self.assertEqual(self.gateway.db.execute('SELECT count(*) FROM sent').fetchone()[0],0)
        # The guard survives restarting the serial process while the API is offline.
        other=Gateway(self.gateway.config,None,str(Path(self.directory.name)/'spool.db'))
        try:
            other.api=self.gateway.api;other.poll()
            self.assertEqual(other.db.execute('SELECT count(*) FROM sent').fetchone()[0],0)
        finally: other.db.close()

    def test_spool_limit_does_not_ack_unpersisted_telemetry(self):
        self.gateway.max_rows=1
        for i in range(2):
            self.port.incoming=encode(Frame(1,TELEMETRY,i,{'messageId':f'boot_{i}','measuredAt':'2026-10-15T00:00:00Z','readings':[]}))
            self.gateway.receive()
        self.assertEqual(len(self.port.outgoing),1)

    def test_partial_writes_finish_the_frame(self):
        data=bytearray()
        def write(packet):
            data.extend(packet[:3]);return min(3,len(packet))
        self.port.write=write
        packet=encode(Frame(1,COMMAND,5,{'action':'STOP'}))
        self.gateway.write_packet(packet)
        self.assertEqual(bytes(data),packet)

    def test_expired_persisted_command_never_reaches_wire(self):
        self.gateway.api=lambda *args:[{'id':23,'expiresAt':expires(),'payload':json.dumps({'action':'SET_ENABLED','value':1})}]
        self.gateway.poll()
        self.gateway.db.execute('UPDATE sent SET expires=0');self.gateway.db.commit()
        self.gateway.retry()
        self.assertEqual(self.port.outgoing,[])
        self.assertEqual(self.gateway.db.execute('SELECT count(*) FROM sent').fetchone()[0],0)

    def test_http_failure_does_not_block_serial_connection(self):
        # Separate SQLite connections model the serial and HTTP workers.
        other=Gateway(self.gateway.config,None,str(Path(self.directory.name)/'spool.db'))
        try:
            other.api=lambda *args: (_ for _ in ()).throw(OSError('offline'))
            self.port.incoming=encode(Frame(1,TELEMETRY,1,{'messageId':'boot_1','measuredAt':'2026-10-15T00:00:00Z','readings':[]}))
            self.gateway.receive();other.flush()
            self.assertEqual(other.db.execute('SELECT count(*) FROM uplink').fetchone()[0],1)
            self.assertEqual(len(self.port.outgoing),1)
        finally: other.db.close()

    def test_stalled_http_worker_does_not_delay_durable_serial_ack(self):
        waiting,release=threading.Event(),threading.Event()
        failures=[]
        def worker():
            gateway=Gateway(self.gateway.config,None,str(Path(self.directory.name)/'spool.db'))
            try:
                def api(*args):
                    waiting.set();release.wait(3);return []
                gateway.api=api;gateway.poll()
            except Exception as exc: failures.append(exc)
            finally: gateway.db.close()
        thread=threading.Thread(target=worker);thread.start()
        try:
            self.assertTrue(waiting.wait(2))
            self.port.incoming=encode(Frame(1,TELEMETRY,2,{'messageId':'boot_2','measuredAt':'2026-10-15T00:00:00Z','readings':[]}))
            self.gateway.receive()
            self.assertEqual(len(self.port.outgoing),1)
            self.assertTrue(thread.is_alive())
        finally: release.set();thread.join(4)
        self.assertEqual(failures,[])


if __name__ == '__main__': unittest.main()
