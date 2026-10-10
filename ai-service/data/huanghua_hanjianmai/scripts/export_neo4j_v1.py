"""Compatibility entry point for the reviewed wheat pipeline."""
import runpy,sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[3]))
if __name__ == "__main__":
    runpy.run_module('wheat.repository',run_name="__main__")
