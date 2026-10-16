"""Virtual firmware for paired COM ports / Linux PTYs. Never connects to live actuators."""
import argparse
from datetime import datetime, timezone
import json
import time
import uuid
from pathlib import Path
from protocol import Frame, Decoder, encode, TELEMETRY, COMMAND, ACK


class Firmware:
    def __init__(self, address, state_path):
        self.address, self.path = address, Path(state_path)
        self.state = json.loads(self.path.read_text()) if self.path.exists() else {'receipts': {}, 'enabled': False, 'level': 0}
        self.off_at = 0

    def persist(self):
        self.path.parent.mkdir(parents=True, exist_ok=True)
        temporary = self.path.with_suffix('.tmp')
        temporary.write_text(json.dumps(self.state))
        temporary.replace(self.path)

    def command(self, frame):
        if frame.kind != COMMAND or frame.address != self.address:
            return None
        key = str(frame.sequence)
        if key in self.state['receipts']:
            return Frame(self.address, ACK, frame.sequence, self.state['receipts'][key])
        payload = frame.payload; action = payload.get('action'); value = payload.get('value', 0); duration = payload.get('durationSeconds', 0)
        success = action in ('SET_ENABLED', 'SET_LEVEL', 'SAMPLE', 'STOP', 'SELF_TEST') and isinstance(value, int) and 0 <= value <= 100 and isinstance(duration, int) and 0 <= duration <= 3600
        success = success and (action != 'SET_ENABLED' or value in (0, 1))
        if success:
            if action == 'SET_ENABLED': self.state['enabled'] = value == 1
            if action == 'SET_LEVEL': self.state['level'] = value
            if action == 'STOP': self.state['enabled'] = False; self.state['level'] = 0
            if action in ('SET_ENABLED', 'SET_LEVEL') and duration: self.off_at = time.monotonic() + duration
        receipt = {'success': success, 'detail': 'simulator only'}
        self.state['receipts'][key] = receipt
        # Keep bounded durable deduplication window. Real firmware must use its flash/NVS journal.
        self.state['receipts'] = dict(list(self.state['receipts'].items())[-256:])
        self.persist()
        return Frame(self.address, ACK, frame.sequence, receipt)

    def watchdog(self):
        if self.off_at and time.monotonic() >= self.off_at:
            self.state['enabled'] = False; self.state['level'] = 0; self.off_at = 0; self.persist()


def main():
    import serial
    parser = argparse.ArgumentParser(); parser.add_argument('--port', required=True); parser.add_argument('--address', type=int, default=1); parser.add_argument('--state', default='var/serial-simulator.json'); args = parser.parse_args()
    firmware = Firmware(args.address, args.state); decoder = Decoder(); boot = uuid.uuid4().hex; sequence = 0; next_sample = 0; pending = None; retry = 0
    # Power-up fail-safe: actuator always starts disabled, even after an unclean restart.
    firmware.state['enabled'] = False; firmware.state['level'] = 0; firmware.persist()
    with serial.serial_for_url(args.port, baudrate=115200, timeout=.05, write_timeout=1) as port:
        while True:
            for frame in decoder.feed(port.read(4096)):
                receipt = firmware.command(frame)
                if receipt: port.write(encode(receipt))
                if pending and frame.address == args.address and frame.kind == ACK and frame.sequence == pending.sequence and frame.payload.get('scope') == 'gateway_durable': pending = None
            now = time.monotonic(); firmware.watchdog()
            if pending is None and now >= next_sample:
                sequence += 1
                pending = Frame(args.address, TELEMETRY, sequence, {'messageId': boot+'_'+str(sequence), 'measuredAt': datetime.now(timezone.utc).isoformat(), 'readings': [{'metric': 'temperature', 'value': 24.5}, {'metric': 'airHumidity', 'value': 68}]})
                retry = 0; next_sample = now + 5
            if pending and now >= retry: port.write(encode(pending)); retry = now + 2


if __name__ == '__main__': main()
