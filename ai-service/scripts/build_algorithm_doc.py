"""Generate a standalone Word document with standard-library OOXML."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
from xml.sax.saxutils import escape
import xml.etree.ElementTree as ET

ROOT=Path(__file__).resolve().parents[1]
source=ROOT/'docs/农业GraphRAG检索算法说明.md'
target=source.with_suffix('.docx')
paragraphs=[]
for line in source.read_text(encoding='utf-8').splitlines():
    heading=line.startswith('#')
    text=line.lstrip('# ').strip() if heading else line
    size='32' if line.startswith('# ') else '26' if heading else '22'
    paragraphs.append('<w:p><w:pPr><w:spacing w:after="140"/>'+('<w:keepNext/>' if heading else '')+'</w:pPr><w:r><w:rPr><w:rFonts w:ascii="Calibri" w:eastAsia="Microsoft YaHei"/>'+('<w:b/>' if heading else '')+f'<w:sz w:val="{size}"/></w:rPr><w:t xml:space="preserve">'+escape(text)+'</w:t></w:r></w:p>')
document='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>'+''.join(paragraphs)+'<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1200" w:right="1200" w:bottom="1200" w:left="1200"/></w:sectPr></w:body></w:document>'
with ZipFile(target,'w',ZIP_DEFLATED) as archive:
    archive.writestr('[Content_Types].xml','<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>')
    archive.writestr('_rels/.rels','<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>')
    archive.writestr('word/document.xml',document)
with ZipFile(target) as archive:
    assert archive.testzip() is None
    for name in archive.namelist(): ET.fromstring(archive.read(name))
print(str(target))
