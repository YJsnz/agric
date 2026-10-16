"""Durable serial-to-HTTP gateway. Configuration contains device addresses, never secrets."""
import argparse
import json
import logging
import os
import sqlite3
import time
import threading
import signal
import urllib.request
import urllib.error
from pathlib import Path
from datetime import datetime
from protocol import Frame, Decoder, encode, TELEMETRY, COMMAND, ACK, VEHICLE_EVENT


class Gateway:
    def __init__(self, config, serial, spool):
        self.config, self.serial = config, serial
        self.decoder = Decoder()
        self.db = sqlite3.connect(spool)
        self.db.execute('PRAGMA journal_mode=WAL')
        self.db.execute('PRAGMA synchronous=FULL')
        self.db.execute('PRAGMA busy_timeout=5000')
        self.db.execute('CREATE TABLE IF NOT EXISTS uplink (id INTEGER PRIMARY KEY, device TEXT, kind TEXT, payload TEXT)')
        self.db.execute('CREATE TABLE IF NOT EXISTS sent (command INTEGER PRIMARY KEY, device TEXT, address INTEGER, packet BLOB, attempts INTEGER, retry REAL)')
        self.db.execute('CREATE TABLE IF NOT EXISTS rejected (id INTEGER PRIMARY KEY, device TEXT, kind TEXT, payload TEXT, http_status INTEGER)')
        self.db.execute('CREATE TABLE IF NOT EXISTS receipts (command INTEGER PRIMARY KEY, device TEXT)')
        if 'message_key' not in {r[1] for r in self.db.execute('PRAGMA table_info(uplink)')}:
            self.db.execute('ALTER TABLE uplink ADD COLUMN message_key TEXT')
        self.db.execute('CREATE UNIQUE INDEX IF NOT EXISTS uplink_message ON uplink(device,kind,message_key)')
        if 'expires' not in {r[1] for r in self.db.execute('PRAGMA table_info(sent)')}:
            self.db.execute('ALTER TABLE sent ADD COLUMN expires REAL NOT NULL DEFAULT 0')
        self.db.commit()
        self.max_rows = int(config.get('maxSpoolRows', 100000))
        if self.max_rows < 1:
            raise ValueError('maxSpoolRows must be positive')
        self.devices = {int(d['address']): d['entityId'] for d in config['devices']}
        self.vehicle_devices = {d['entityId'] for d in config['devices'] if d.get('role') == 'vehicle'}
        if len(self.devices) != len(config['devices']) or any(not 1 <= a <= 247 for a in self.devices):
            raise ValueError('Duplicate or invalid serial address')

    def write_packet(self, packet):
        offset = 0
        while offset < len(packet):
            written = self.serial.write(packet[offset:])
            if written is None or written <= 0 or written > len(packet) - offset:
                raise IOError('Serial write made no progress')
            offset += written
        self.serial.flush()

    def queue_receipt(self, command, device, payload):
        self.db.execute('INSERT INTO uplink(device,kind,payload) VALUES (?,?,?)', (device, 'acks', json.dumps(payload)))
        self.db.execute('INSERT OR REPLACE INTO receipts VALUES (?,?)', (command, device))
        self.db.execute('DELETE FROM sent WHERE command=?', (command,))

    def api(self, device, path, payload=None):
        from urllib.parse import quote
        base = self.config['api'].rstrip('/') + '/api/farms/' + quote(self.config['farm'], safe='')
        url = base + ('/transport/vehicles/' + quote(device, safe='') + '/events' if path == '/vehicle-events' else '/embedded/' + quote(device, safe='') + path)
        request = urllib.request.Request(url, data=None if payload is None else json.dumps(payload).encode(), headers={
            'Authorization': 'Bearer ' + os.environ['AGRIC_GATEWAY_TOKEN'], 'Content-Type': 'application/json'})
        with urllib.request.urlopen(request, timeout=3) as response:
            return json.load(response)

    def receive(self):
        for frame in self.decoder.feed(self.serial.read(4096)):
            device = self.devices.get(frame.address)
            if not device:
                logging.warning('Unknown serial address %s', frame.address)
                continue
            if frame.kind in (TELEMETRY, VEHICLE_EVENT):
                if frame.kind == VEHICLE_EVENT and device not in self.vehicle_devices:
                    logging.warning('Vehicle event from an unbound device rejected')
                    continue
                # Firmware messageId includes persistent boot UUID + sample counter.
                required = ('messageId','taskId','stopId','phase','event','occurredAt') if frame.kind == VEHICLE_EVENT else ('messageId','measuredAt','readings')
                uplink_kind = 'vehicle-events' if frame.kind == VEHICLE_EVENT else 'telemetry'
                if not all(k in frame.payload for k in required):
                    continue
                key = frame.payload['messageId']
                if not isinstance(key, str) or not 1 <= len(key) <= 64:
                    continue
                payload = json.dumps(frame.payload, sort_keys=True, separators=(',', ':'), allow_nan=False)
                existing = self.db.execute('SELECT payload FROM uplink WHERE device=? AND kind=? AND message_key=?', (device, uplink_kind, key)).fetchone()
                if existing and existing[0] != payload:
                    logging.error('Conflicting telemetry messageId from %s', device)
                    continue
                if not existing:
                    count = self.db.execute('SELECT (SELECT count(*) FROM uplink)+(SELECT count(*) FROM rejected)').fetchone()[0]
                    if count >= self.max_rows:
                        logging.error('Spool full; telemetry not acknowledged')
                        continue
                    self.db.execute('INSERT INTO uplink(device,kind,payload,message_key) VALUES (?,?,?,?)', (device, uplink_kind, payload, key))
            elif frame.kind == ACK:
                pending = self.db.execute('SELECT command FROM sent WHERE command=? AND address=?', (frame.sequence, frame.address)).fetchone()
                if not pending or not isinstance(frame.payload.get('success'), bool):
                    continue
                payload = {'commandId': frame.sequence, 'success': frame.payload['success'], 'detail': str(frame.payload.get('detail', ''))[:200]}
                self.queue_receipt(frame.sequence, device, payload)
            self.db.commit()
            if frame.kind in (TELEMETRY, VEHICLE_EVENT):
                self.write_packet(encode(Frame(frame.address, ACK, frame.sequence, {'success': True, 'scope': 'gateway_durable', 'messageId': frame.payload['messageId']})))

    def flush(self):
        for row_id, device, kind, payload in self.db.execute("SELECT id,device,kind,payload FROM uplink ORDER BY CASE kind WHEN 'acks' THEN 0 WHEN 'vehicle-events' THEN 0 ELSE 1 END,id LIMIT 4").fetchall():
            try:
                self.api(device, '/' + kind, json.loads(payload))
            except urllib.error.HTTPError as exc:
                if exc.code in (400, 404, 409, 413, 422):
                    self.db.execute('INSERT INTO rejected(device,kind,payload,http_status) VALUES (?,?,?,?)', (device, kind, payload, exc.code))
                    self.db.execute('DELETE FROM uplink WHERE id=?', (row_id,)); self.db.commit()
                    logging.error('Rejected uplink preserved in rejected table: HTTP %s', exc.code)
                    continue
                logging.warning('Uplink retained: HTTP %s', exc.code)
                break
            except Exception as exc:
                # Retain unacknowledged samples across network outages and restarts.
                logging.warning('Uplink retained: %s', type(exc).__name__)
                break
            self.db.execute('DELETE FROM uplink WHERE id=?', (row_id,)); self.db.commit()

    def poll(self):
        for address, device in self.devices.items():
            if device in self.vehicle_devices:
                continue
            pending = self.api(device, '/commands/pending')
            valid = {row['id'] for row in pending}
            # An execution receipt may be waiting for HTTP upload. Do not enqueue
            # the same backend-PENDING command again during that interval.
            completed = {r[0] for r in self.db.execute('SELECT command FROM receipts WHERE device=?', (device,))}
            for command in completed - valid:
                self.db.execute('DELETE FROM receipts WHERE command=?', (command,))
            for (command,) in self.db.execute('SELECT command FROM sent WHERE device=?', (device,)).fetchall():
                if command not in valid:
                    self.db.execute('DELETE FROM sent WHERE command=?', (command,))
            for row in pending:
                if row['id'] in completed:
                    continue
                # A persisted command must not become executable hours later
                # merely because a disconnected Jetson has restarted.
                expires = datetime.fromisoformat(row['expiresAt'].replace('Z', '+00:00')).timestamp()
                if expires <= time.time():
                    continue
                packet = encode(Frame(address, COMMAND, row['id'], json.loads(row['payload'])))
                self.db.execute('INSERT OR IGNORE INTO sent(command,device,address,packet,attempts,retry,expires) SELECT ?,?,?,?,0,0,? WHERE NOT EXISTS (SELECT 1 FROM receipts WHERE command=?)', (row['id'], device, address, packet, expires, row['id']))
            self.db.commit()

    def retry(self):
        for command, device, packet, attempts, expires in self.db.execute('SELECT command,device,packet,attempts,expires FROM sent WHERE retry<=? OR expires<=?', (time.time(),time.time())).fetchall():
            if attempts >= 3 or expires <= time.time():
                self.queue_receipt(command, device, {'commandId': command, 'success': False, 'detail': 'command expired locally' if expires <= time.time() else 'serial timeout after 3 attempts'})
            else:
                self.write_packet(packet)
                self.db.execute('UPDATE sent SET attempts=attempts+1,retry=? WHERE command=?', (time.time()+2, command))
            self.db.commit()


def network_worker(config, spool, stop):
    gateway = Gateway(config, None, spool)
    try:
        while not stop.is_set():
            gateway.flush()
            if stop.is_set():
                break
            try:
                gateway.poll()
            except Exception as exc:
                gateway.db.rollback()
                logging.warning('Command poll failed: %s', type(exc).__name__)
            stop.wait(1)
    finally:
        gateway.db.close()


def main():
    parser = argparse.ArgumentParser(); parser.add_argument('--config', default='embedded/gateway.example.json'); parser.add_argument('--spool', default='var/serial-gateway.sqlite'); args = parser.parse_args()
    import serial
    config = json.loads(Path(args.config).read_text(encoding='utf-8'))
    Path(args.spool).parent.mkdir(parents=True, exist_ok=True)
    logging.basicConfig(level=logging.INFO)
    gateway = Gateway(config, None, args.spool)
    stop = threading.Event()
    signal.signal(signal.SIGTERM, lambda *_: stop.set())
    worker = threading.Thread(target=network_worker, args=(config, args.spool, stop), daemon=True, name='serial-http')
    worker.start()
    delay = 1
    try:
        while not stop.is_set():
            try:
                # On Jetson use a stable /dev/serial/by-id/... path.
                with serial.serial_for_url(config['port'], baudrate=config.get('baudrate', 115200), bytesize=8, parity='N', stopbits=1, timeout=.05, write_timeout=1) as port:
                    gateway.serial = port
                    gateway.decoder = Decoder()
                    delay = 1
                    while not stop.is_set():
                        if not worker.is_alive():
                            raise RuntimeError('HTTP worker stopped; restart gateway to recover')
                        gateway.receive()
                        gateway.retry()
            except (serial.SerialException, OSError) as exc:
                gateway.db.rollback()
                logging.warning('Serial disconnected (%s); retry in %ss', type(exc).__name__, delay)
                stop.wait(delay)
                delay = min(30, delay * 2)
    except KeyboardInterrupt:
        pass
    finally:
        stop.set()
        worker.join(timeout=15)
        gateway.db.close()


if __name__ == '__main__':
    main()
