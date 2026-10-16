cmake_minimum_required(VERSION 3.18)
# Jetson Orin uses SM87; override explicitly for another NVIDIA GPU.
if(NOT DEFINED CMAKE_CUDA_ARCHITECTURES)
  set(CMAKE_CUDA_ARCHITECTURES 87)
endif()
project(agric_cuda LANGUAGES CXX CUDA)
add_library(agric_cuda SHARED agric_ops.cu)
set_target_properties(agric_cuda PROPERTIES CUDA_STANDARD 17 CXX_STANDARD 17)
target_compile_options(agric_cuda PRIVATE $<$<COMPILE_LANGUAGE:CUDA>:--fmad=false>)
