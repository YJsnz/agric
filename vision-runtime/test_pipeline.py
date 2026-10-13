import json
import os
import pathlib
import subprocess
import sys
import unittest
import numpy as np
from pipeline import decode, ROOT
from backends import create_backend


class DecodeTests(unittest.TestCase):
    def test_nms_suppresses_same_class_but_preserves_other_classes(self):
        manifest={"classes":{"0":"curl","1":"spot","2":"slug"}}
        output=np.zeros((1,7,3),dtype=np.float32)
        output[0,:4,:]=np.array([[100,100,100],[100,100,100],[50,50,50],[50,50,50]])
        output[0,4:,:]=np.array([[.9,.8,0],[0,0,.85],[0,0,0]])
        results=decode(output,manifest,200,200,1,0,0,.55)
        self.assertEqual([row["classId"] for row in results],[0,1])

    def test_rejects_changed_export_shape_and_invalid_accelerator(self):
        with self.assertRaises(ValueError):
            decode(np.zeros((1,6,3)),{"classes":{"0":"curl"}},200,200,1,0,0,.55)
        previous=os.environ.get("VISION_BACKEND")
        os.environ["VISION_BACKEND"]="unsupported"
        try:
            with self.assertRaises(ValueError): create_backend(None,{})
        finally:
            if previous is None: os.environ.pop("VISION_BACKEND")
            else: os.environ["VISION_BACKEND"]=previous

    def test_resident_worker_processes_frames_and_survives_bad_image(self):
        image=ROOT.parent/"frontend/public/assets/vision/pear-leaf-example.jpg"
        env={**os.environ,"VISION_BACKEND":"onnx-cpu"}
        worker=subprocess.Popen([sys.executable,"-u",str(ROOT/"infer.py"),"--worker"],
                                stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=subprocess.PIPE,
                                text=True,encoding="utf-8",env=env)
        try:
            self.assertEqual(json.loads(worker.stdout.readline())["type"],"ready")
            results=[]
            for identifier,path in [("1",image),("bad",ROOT/"missing.jpg"),("2",image)]:
                worker.stdin.write(json.dumps({"id":identifier,"path":str(path)})+"\n")
                worker.stdin.flush()
                response=json.loads(worker.stdout.readline())
                self.assertEqual(response["id"],identifier)
                if identifier=="bad": self.assertIn("error",response)
                else: results.append(response["result"])
            self.assertEqual(results[0]["detections"],results[1]["detections"])
            self.assertEqual(results[0]["runtime"]["backend"],"onnx-cpu")
            self.assertIsNone(worker.poll())
        finally:
            worker.stdin.close()
            worker.wait(timeout=10)
            worker.stdout.close();worker.stderr.close()


if __name__=="__main__":
    unittest.main()
