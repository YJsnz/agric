"""Optional NVIDIA nvImageCodec decoder for device-resident JPEG input."""
import ctypes as ct

from tensorrt_backend import CudaRuntime


class SynchronizedDeviceImage:
    """Keep the nvImageCodec allocation alive and expose its completed buffer."""
    def __init__(self, image):
        self.owner = image
        self.shape = image.shape
        self.dtype = image.dtype
        interface = dict(image.__cuda_array_interface__)
        interface['stream'] = None
        self.__cuda_array_interface__ = interface


class NvImageCodecDecoder:
    """Decode JPEG to interleaved uint8 sRGB on a CUDA device, without CPU pixels."""
    def __init__(self):
        try:
            from nvidia import nvimgcodec
        except ImportError as exc:
            raise RuntimeError(
                'VISION_IMAGE_DECODE=nvimgcodec requires NVIDIA nvImageCodec with the nvJPEG extension'
            ) from exc
        self.nvimgcodec = nvimgcodec
        self.cuda = CudaRuntime()
        backend = nvimgcodec.Backend(nvimgcodec.BackendKind.GPU_ONLY, load_hint=1.0)
        self.decoder = nvimgcodec.Decoder(backends=[backend])
        self.params = nvimgcodec.DecodeParams(
            color_spec=nvimgcodec.ColorSpec.SRGB,
            sample_format=nvimgcodec.SampleFormat.I_RGB,
            apply_exif_orientation=True,
        )

    def decode(self, path):
        try:
            image = self.decoder.read(str(path), params=self.params)
            if getattr(image, 'shape', None) is None or len(image.shape) != 3 or image.shape[2] != 3:
                raise ValueError('nvImageCodec JPEG output must be interleaved HWC RGB')
            if str(getattr(image, 'dtype', '')).lower() not in ('uint8', '|u1'):
                raise ValueError('nvImageCodec JPEG output must be uint8')
            producer_stream = image.__cuda_array_interface__.get('stream')
            if producer_stream not in (None, 0):
                # Include actual device decode completion in imageDecodeMs.
                self.cuda.call('cudaStreamSynchronize', ct.c_void_p(producer_stream))
            return SynchronizedDeviceImage(image), None
        except Exception as exc:
            # Some JPEG variants may not be supported by the installed codec.
            return None, f'{type(exc).__name__}: {exc}'[:160]

    def close(self):
        self.decoder = None
