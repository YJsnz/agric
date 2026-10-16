"""TY serial v1: AA55 | version:u8 | address:u8 | kind:u8 | sequence:u32le
| payload_length:u16le | UTF-8 JSON | CRC16/Modbus:u16le.
CRC covers version through payload. Maximum payload 2048 bytes.
"""
import json
import struct
import time
from dataclasses import dataclass

SYNC = b'\xaa\x55'
HEADER = struct.Struct('<BBBIH')
TELEMETRY, COMMAND, ACK, HELLO, VEHICLE_EVENT = 1, 2, 3, 4, 5
MAX_PAYLOAD = 2048


def crc16(data):
    crc = 0xffff
    for value in data:
        crc ^= value
        for _ in range(8):
            crc = (crc >> 1) ^ (0xa001 if crc & 1 else 0)
    return crc


@dataclass(frozen=True)
class Frame:
    address: int
    kind: int
    sequence: int
    payload: dict


def encode(frame):
    if not 1 <= frame.address <= 247 or frame.kind not in (1, 2, 3, 4, 5):
        raise ValueError('Invalid address or kind')
    payload = json.dumps(frame.payload, separators=(',', ':'), ensure_ascii=False, allow_nan=False).encode()
    if len(payload) > MAX_PAYLOAD:
        raise ValueError('Payload exceeds 2048 bytes')
    body = HEADER.pack(1, frame.address, frame.kind, frame.sequence, len(payload)) + payload
    return SYNC + body + struct.pack('<H', crc16(body))


class Decoder:
    """Incremental decoder accepts fragmentation, coalescing and line noise."""
    def __init__(self):
        self.buffer = bytearray()
        self.rejected = 0
        self.last_byte = None

    def feed(self, data):
        now = time.monotonic()
        if self.buffer and self.last_byte is not None and now-self.last_byte > .25:
            self.buffer.clear()
            self.rejected += 1
        if data:
            self.last_byte = now
        self.buffer.extend(data)
        frames = []
        while True:
            start = self.buffer.find(SYNC)
            if start < 0:
                self.buffer[:] = self.buffer[-1:] if self.buffer.endswith(SYNC[:1]) else b''
                break
            del self.buffer[:start]
            if len(self.buffer) < 11:
                break
            version, address, kind, sequence, length = HEADER.unpack_from(self.buffer, 2)
            if version != 1 or not 1 <= address <= 247 or kind not in (1, 2, 3, 4, 5) or length > MAX_PAYLOAD:
                del self.buffer[0]; self.rejected += 1
                continue
            end = 11 + length
            if len(self.buffer) < end + 2:
                break
            if crc16(self.buffer[2:end]) != struct.unpack_from('<H', self.buffer, end)[0]:
                del self.buffer[0]; self.rejected += 1
                continue
            try:
                payload = json.loads(self.buffer[11:end].decode(), parse_constant=lambda _: (_ for _ in ()).throw(ValueError('non-finite')))
                if not isinstance(payload, dict):
                    raise ValueError('Object required')
                frames.append(Frame(address, kind, sequence, payload))
            except (ValueError, UnicodeError):
                self.rejected += 1
            del self.buffer[:end + 2]
        return frames
