import unittest
from protocol import *


class ProtocolTests(unittest.TestCase):
    def test_crc_reference(self):
        self.assertEqual(crc16(b'123456789'), 0x4b37)

    def test_fragmentation_noise_and_coalescing(self):
        frame = Frame(2, TELEMETRY, 0xffffffff, {'temperature': 23.5, 'label': '番茄'})
        packet = encode(frame)
        for split in range(len(packet)+1):
            decoder = Decoder()
            results = decoder.feed(b'noise' + packet[:split]) + decoder.feed(packet[split:] + packet)
            self.assertEqual(results, [frame, frame])

    def test_bad_crc_resynchronizes(self):
        frame = Frame(3, ACK, 42, {'success': True})
        bad = bytearray(encode(frame)); bad[-1] ^= 1
        decoder = Decoder()
        self.assertEqual(decoder.feed(bad + encode(frame)), [frame])
        self.assertGreater(decoder.rejected, 0)

    def test_reject_oversize(self):
        with self.assertRaises(ValueError):
            encode(Frame(1, COMMAND, 1, {'data': 'x'*2049}))

    def test_partial_frame_times_out(self):
        frame = Frame(1, ACK, 4, {'success': True})
        decoder = Decoder();decoder.feed(encode(frame)[:12]);decoder.last_byte -= 1
        self.assertEqual(decoder.feed(encode(frame)), [frame])


if __name__ == '__main__':
    unittest.main()
