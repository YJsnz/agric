"""Host-independent environment binding for an optional sidecar."""
import os,runpy
from pathlib import Path
os.environ.setdefault('MULTICROP_LLM_BASE_URL',os.getenv('AGENT_BASE_URL','http://127.0.0.1:11434/v1'))
os.environ.setdefault('MULTICROP_LLM_MODEL',os.getenv('AGENT_MODEL','qwen2.5:7b'))
os.environ.setdefault('MULTICROP_LLM_API_KEY',os.getenv('AGENT_API_KEY') or 'ollama')
runpy.run_path(str(Path(__file__).with_name('integration_app.py')),run_name='__main__')
