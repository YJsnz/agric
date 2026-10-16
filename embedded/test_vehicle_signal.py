import tempfile
import unittest
from pathlib import Path
from vehicle_signal import VehicleSignals
from gateway import Gateway
from protocol import Frame, Decoder, encode, ACK, VEHICLE_EVENT


class VehicleSignalTests(unittest.TestCase):
    def test_vehicle_to_gateway_durable_ack_and_backend_replay(self):
        with tempfile.TemporaryDirectory() as root:
            reporter=VehicleSignals(str(Path(root)/'vehicle.sqlite'))
            message=reporter.queue('task-123','warehouse','COMPLETED')
            reporter.db.close()
            reporter=VehicleSignals(str(Path(root)/'vehicle.sqlite'))
            self.assertEqual(reporter.queue('task-123','warehouse','COMPLETED'),message)
            class Port:
                incoming=b''
                def read(self,size): result=self.incoming;self.incoming=b'';return result
                def write(self,packet): self.incoming+=packet;return len(packet)
                def flush(self): pass
            gateway_port=Port()
            gateway=Gateway({'devices':[{'address':5,'entityId':'cart-01','role':'vehicle'}]},gateway_port,str(Path(root)/'gateway.sqlite'))
            class VehiclePort:
                def write(self,packet): gateway_port.incoming=packet;gateway.receive();return len(packet)
                def read(self,size): return gateway_port.read(size)
                def flush(self): pass
            try:
                self.assertTrue(reporter.exchange(VehiclePort(),timeout=.1))
                # Gateway must not poll generic actuator commands for a vehicle.
                gateway.api=lambda *args: (_ for _ in ()).throw(AssertionError('vehicle polled'))
                gateway.poll()
                gateway.api=lambda *args: (_ for _ in ()).throw(OSError('offline'))
                gateway.flush();self.assertEqual(gateway.db.execute('SELECT count(*) FROM uplink').fetchone()[0],1)
                delivered=[];gateway.api=lambda *args:delivered.append(args);gateway.flush()
                self.assertEqual(delivered[0][0:2],('cart-01','/vehicle-events'))
                self.assertEqual(delivered[0][2]['messageId'],message)
            finally: reporter.db.close();gateway.db.close()

    def test_unbound_sensor_cannot_emit_vehicle_event(self):
        with tempfile.TemporaryDirectory() as root:
            class Port:
                def read(self,size):return encode(Frame(1,VEHICLE_EVENT,1,{'messageId':'m','taskId':'t','stopId':'warehouse','phase':'DELIVERY','event':'COMPLETED','occurredAt':'2026-10-16T00:00:00Z'}))
                def write(self,p):raise AssertionError('unbound event acknowledged')
            gateway=Gateway({'devices':[{'address':1,'entityId':'yt-weather'}]},Port(),str(Path(root)/'db'))
            try:
                gateway.receive();self.assertEqual(gateway.db.execute('SELECT count(*) FROM uplink').fetchone()[0],0)
            finally:gateway.db.close()
