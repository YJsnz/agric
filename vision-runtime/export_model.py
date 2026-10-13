"""One-time conversion of the pinned public pear-leaf checkpoint to ONNX."""
import json, hashlib, shutil, pathlib, sys
from importlib.metadata import distribution
from ultralytics import YOLO
ROOT=pathlib.Path(__file__).resolve().parent
SOURCE=pathlib.Path(sys.argv[1]) if len(sys.argv)>1 else ROOT.parent/'target/pear-upstream/yolov8-pear-experiments/grid-opt/weights/best.pt'
model=YOLO(str(SOURCE))
print('CLASSES',model.names,flush=True)
output=model.export(format='onnx',imgsz=640,dynamic=False,simplify=False,opset=18,device='cpu')
folder=ROOT/'models';folder.mkdir(exist_ok=True)
shutil.copyfile(output,folder/'pear-leaf.onnx')
manifest={'modelId':'diamos-pear-leaf-yolov8s-v1','task':'pear_leaf_symptom_detection','inputSize':640,
 'classes':model.names,'source':'https://github.com/Wb-az/yolov8-disease-detection-agriculture',
 'commit':'a435fd29d197dd7bcab016cd86e30f87c1f3ce7c','dataset':'DiaMOS Plant',
 'checkpointSha256':hashlib.sha256(SOURCE.read_bytes()).hexdigest(),
 'sha256':hashlib.sha256((folder/'pear-leaf.onnx').read_bytes()).hexdigest(),
 'limitations':['公开梨叶模型，未经泊头鸭梨独立验证','不适用于果实外观质检或整园航拍','检测置信度不是病害概率；未检出不代表健康','没有病斑分割，不计算病斑面积或农药剂量']}
(folder/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf8')
license_path=SOURCE.parent/'UPSTREAM-LICENSE.txt'
if not license_path.exists():license_path=ROOT.parent/'target/pear-upstream/LICENSE'
shutil.copyfile(license_path,folder/'UPSTREAM-LICENSE.txt')
for file in distribution('ultralytics').files:
    if str(file).replace('\\','/').endswith('/licenses/LICENSE'):
        shutil.copyfile(distribution('ultralytics').locate_file(file),folder/'ULTRALYTICS-AGPL3.txt')
