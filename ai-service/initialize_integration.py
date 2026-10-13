"""Import branch snapshots into the dedicated multi-crop database. No database deletes."""
import sys,json
from pathlib import Path
ROOT=Path(__file__).resolve().parent
sys.path.insert(0,str(ROOT))
from wheat.repository import transaction,import_graph as wheat_import
from jujube.runtime import import_graph as jujube_import
from qingxian_diagnosis.knowledge_service import store

def main():
    statements=[]
    for line in (ROOT/'knowledge_graph/generated/import.cypher').read_text(encoding='utf-8').splitlines():
        value=line.strip()
        if value and not value.startswith('//'):
            statements.append({'statement':value.removesuffix(';')})
    schema=[item for item in statements if item['statement'].startswith('CREATE CONSTRAINT')]
    statements=[item for item in statements if item not in schema]
    for item in schema:transaction([item])
    for start in range(0,len(statements),100):
        transaction(statements[start:start+100])
    vegetable=json.loads((store.root/'knowledge_graph/graph-v1.json').read_text(encoding='utf-8'))
    print(json.dumps({'pearStatements':len(statements),'wheat':wheat_import(),'jujube':jujube_import(),'vegetable':store.import_graph(vegetable)},ensure_ascii=False))
if __name__=='__main__':main()
