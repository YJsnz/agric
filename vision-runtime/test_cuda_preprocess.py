import ctypes as ct
import os
import unittest
from unittest.mock import Mock
import numpy as np
from cuda_preprocess import cpu_reference, geometry, CudaPreprocessor
from tensorrt_backend import CudaRuntime
from tensorrt_backend import TensorRtBackend
from cuda_preprocess import DeviceTensor


class ReferenceTests(unittest.TestCase):
    def test_identity_preserves_rgb_channels(self):
        image = np.array([[[255,0,0],[0,255,0]],[[0,0,255],[255,255,255]]],dtype=np.uint8)
        tensor, meta = cpu_reference(image,2)
        np.testing.assert_array_equal(tensor[0],image.transpose(2,0,1)/np.float32(255))
        self.assertEqual(meta,(1,0,0))

    def test_padding_and_degenerate_aspect_ratio(self):
        image = np.full((1,100,3),255,dtype=np.uint8)
        tensor, (_,left,top) = cpu_reference(image,8)
        self.assertEqual((left,top),(0,3))
        np.testing.assert_allclose(tensor[0,:,0,:],114/255)
        np.testing.assert_allclose(tensor[0,:,3,:],1)
        with self.assertRaises(ValueError): geometry(0,1,640)

    def test_device_tensor_is_not_uploaded_again_and_foreign_stream_is_rejected(self):
        backend=TensorRtBackend.__new__(TensorRtBackend)
        backend.cuda=Mock();backend.context=Mock();backend.context.execute_async_v3.return_value=True
        backend.stream=ct.c_void_p(17);backend.inputs=['input'];backend.outputs=['output']
        backend.buffers={'input':(np.zeros((1,3,2,2),np.float32),ct.c_void_p(123)),
                         'output':(np.zeros((1,5,1),np.float32),ct.c_void_p(456))}
        backend.run(DeviceTensor(123,(1,3,2,2),17))
        transfers=[c for c in backend.cuda.call.call_args_list if c.args[0]=='cudaMemcpyAsync']
        self.assertEqual(len(transfers),1)
        self.assertEqual(transfers[0].args[4],2)  # only output device -> host
        with self.assertRaises(ValueError): backend.run(DeviceTensor(123,(1,3,2,2),99))


@unittest.skipUnless(os.getenv('AGRIC_TEST_CUDA') == '1','requires built CUDA operators and NVIDIA GPU')
class CudaParityTests(unittest.TestCase):
    def test_random_identity_resize_padding_quality_and_buffer_growth(self):
        cuda, stream, output = CudaRuntime(), ct.c_void_p(), ct.c_void_p()
        cuda.call('cudaStreamCreate',ct.byref(stream))
        preprocessor = None
        try:
            cuda.call('cudaMalloc',ct.byref(output),3*64*64*4)
            preprocessor = CudaPreprocessor(cuda,stream,64)
            rng = np.random.default_rng(17)
            images=[rng.integers(0,256,(h,w,3),dtype=np.uint8) for h,w in [(64,64),(13,27),(99,11),(128,193),(1,1000),(3,3)]]
            images += [np.full((37,59,3),v,dtype=np.uint8) for v in (0,127,255)]
            for image in images:
                tensor,meta,quality,std = preprocessor.prepare(image,output)
                result = np.empty(tensor.shape,np.float32)
                cuda.call('cudaMemcpyAsync',ct.c_void_p(result.ctypes.data),output,result.nbytes,2,stream)
                cuda.call('cudaStreamSynchronize',stream)
                reference,expected_meta = cpu_reference(image,64)
                self.assertEqual(meta,expected_meta)
                np.testing.assert_allclose(result,reference,atol=2e-5,rtol=0)
                gray = image.mean(axis=2)
                self.assertAlmostEqual(quality['brightness'],round(float(gray.mean()),2),places=2)
                self.assertAlmostEqual(std,float(gray.std()),places=3)
        finally:
            if preprocessor is not None: preprocessor.close()
            if output.value: cuda.call('cudaFree',output)
            cuda.call('cudaStreamDestroy',stream)


if __name__ == '__main__': unittest.main()
