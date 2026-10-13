"""Build a board-local TensorRT 10 engine from the checked ONNX."""
import argparse
import hashlib
import json
import pathlib
import platform
from pipeline import ROOT


def main():
    import tensorrt as trt
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", required=True)
    parser.add_argument("--precision", choices=["fp16", "fp32"], default="fp16")
    parser.add_argument("--workspace-mb", type=int, default=512)
    args = parser.parse_args()
    if not 64 <= args.workspace_mb <= 2048:
        parser.error("workspace must be 64..2048 MiB")
    model = ROOT / "models/pear-leaf.onnx"
    manifest = json.loads((ROOT / "models/manifest.json").read_text(encoding="utf-8"))
    if hashlib.sha256(model.read_bytes()).hexdigest() != manifest["sha256"]:
        raise ValueError("ONNX checksum mismatch")
    logger = trt.Logger(trt.Logger.WARNING)
    builder = trt.Builder(logger)
    network = builder.create_network(1 << int(trt.NetworkDefinitionCreationFlag.EXPLICIT_BATCH))
    onnx = trt.OnnxParser(network, logger)
    if not onnx.parse(model.read_bytes()):
        raise RuntimeError("\n".join(str(onnx.get_error(i)) for i in range(onnx.num_errors)))
    config = builder.create_builder_config()
    config.set_memory_pool_limit(trt.MemoryPoolType.WORKSPACE, args.workspace_mb * 1024 * 1024)
    config.builder_optimization_level = 3
    if args.precision == "fp16":
        if not builder.platform_has_fast_fp16:
            raise RuntimeError("FP16 not supported; choose fp32")
        config.set_flag(trt.BuilderFlag.FP16)
    engine = builder.build_serialized_network(network, config)
    if engine is None:
        raise RuntimeError("Engine build failed")
    destination = pathlib.Path(args.output)
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_bytes(bytes(engine))
    metadata = {"onnxSha256": manifest["sha256"], "engineSha256": hashlib.sha256(bytes(engine)).hexdigest(),
                "tensorrtVersion": trt.__version__, "architecture": platform.machine(),
                "precision": args.precision, "workspaceMb": args.workspace_mb}
    destination.with_suffix(destination.suffix + ".json").write_text(json.dumps(metadata, indent=2), encoding="utf-8")
    print(json.dumps(metadata))


if __name__ == "__main__":
    main()
