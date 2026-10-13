"""Meaningful runtime checks; does not claim model accuracy on a duck-pear test set."""
import pathlib,tempfile,json
from PIL import Image
from infer import infer
with tempfile.TemporaryDirectory() as directory:
    path=pathlib.Path(directory)/'blank.png'
    Image.new('RGB',(640,640),(120,120,120)).save(path)
    result=infer(path)
    assert result['status']=='NEEDS_REVIEW' and not result['detections'] and result['warnings']
    Image.new('RGB',(64,64),(0,0,0)).save(path)
    result=infer(path)
    assert result['status']=='NEEDS_REVIEW' and len(result['warnings'])>=2
print(json.dumps({'qualityRejection':True,'tinyImageRejection':True}))
