"""Vehicle-side navigation callback adapter. Never infers arrival from platform animation."""
import argparse
import json
import sqlite3
import time
import uuid
from pathlib import Path
from datetime import datetime, timezone
from protocol import Frame, Decoder, encode, ACK, VEHICLE_EVENT


class VehicleSignals:
    def __init__(self, spool, address=5):
        self.address=address
        self.db=sqlite3.connect(spool)
        self.db.execute('PRAGMA synchronous=FULL')
        self.db.execute('CREATE TABLE IF NOT EXISTS events (id INTEGER PRIMARY KEY,task TEXT,phase TEXT,event TEXT,payload TEXT,delivered INTEGER DEFAULT 0,UNIQUE(task,phase,event))')
        self.db.commit()

    def queue(self, task_id, stop_id, event='ARRIVED', phase='DELIVERY'):
        """Call ARRIVED from localization/docking; COMPLETED only after unloading."""
        if event not in ('ARRIVED','COMPLETED') or phase not in ('DELIVERY','REPOSITION'):
            raise ValueError('Invalid navigation event')
        old=self.db.execute('SELECT payload FROM events WHERE task=? AND phase=? AND event=?',(task_id,phase,event)).fetchone()
        if old:
            payload=json.loads(old[0])
            if payload['stopId'] != stop_id: raise ValueError('Task destination changed')
            return payload['messageId']
        payload={'messageId':uuid.uuid4().hex,'taskId':task_id,'stopId':stop_id,'phase':phase,'event':event,'occurredAt':datetime.now(timezone.utc).isoformat()}
        with self.db:
            self.db.execute('INSERT INTO events(task,phase,event,payload) VALUES (?,?,?,?)',(task_id,phase,event,json.dumps(payload)))
        return payload['messageId']

    def exchange(self, port, timeout=2):
        row=self.db.execute('SELECT id,payload FROM events WHERE delivered=0 ORDER BY id LIMIT 1').fetchone()
        if not row: return True
        sequence,raw=row
        packet=encode(Frame(self.address,VEHICLE_EVENT,sequence,json.loads(raw)))
        offset=0
        while offset<len(packet):
            count=port.write(packet[offset:])
            if not count: raise IOError('Serial write made no progress')
            offset+=count
        port.flush();decoder=Decoder();deadline=time.monotonic()+timeout
        while time.monotonic()<deadline:
            for frame in decoder.feed(port.read(4096)):
                if frame.address==self.address and frame.kind==ACK and frame.sequence==sequence and frame.payload.get('scope')=='gateway_durable' and frame.payload.get('success') is True and frame.payload.get('messageId')==json.loads(raw)['messageId']:
                    with self.db: self.db.execute('UPDATE events SET delivered=1 WHERE id=?',(sequence,))
                    return True
        return False


def main():
    parser=argparse.ArgumentParser();parser.add_argument('--port',required=True);parser.add_argument('--task',required=True);parser.add_argument('--stop',required=True);parser.add_argument('--event',choices=['ARRIVED','COMPLETED'],default='ARRIVED');parser.add_argument('--phase',choices=['DELIVERY','REPOSITION'],default='DELIVERY');parser.add_argument('--spool',default='var/serial-vehicle.sqlite');parser.add_argument('--address',type=int,default=5);args=parser.parse_args()
    import serial
    Path(args.spool).parent.mkdir(parents=True,exist_ok=True)
    reporter=VehicleSignals(args.spool,args.address);reporter.queue(args.task,args.stop,args.event,args.phase)
    try:
        with serial.serial_for_url(args.port,baudrate=115200,timeout=.05,write_timeout=1) as port:
            while reporter.db.execute('SELECT count(*) FROM events WHERE delivered=0').fetchone()[0]:
                reporter.exchange(port)
    finally: reporter.db.close()


if __name__=='__main__': main()
