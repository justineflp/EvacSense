import os
import zipfile
import xml.etree.ElementTree as ET

def extract_docx_text_full(docx_path):
    namespaces = {
        'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
    }
    
    if not zipfile.is_zipfile(docx_path):
        return f"Error: {docx_path} is not a valid zip/docx file."
        
    try:
        with zipfile.ZipFile(docx_path) as docx:
            if 'word/document.xml' not in docx.namelist():
                return "Error: word/document.xml not found."
                
            xml_content = docx.read('word/document.xml')
            root = ET.fromstring(xml_content)
            
            body = root.find('w:body', namespaces)
            if body is None:
                return "Error: w:body not found."
                
            lines = []
            
            # Recursive traversal to capture all w:p and w:tbl, even if nested inside w:sdt or other elements
            def traverse(element):
                tag = element.tag.split('}')[-1]
                if tag == 'p':
                    text = get_paragraph_text(element, namespaces)
                    if text.strip():
                        lines.append(text)
                elif tag == 'tbl':
                    table_text = get_table_text(element, namespaces)
                    if table_text.strip():
                        lines.append(table_text)
                else:
                    for child in element:
                        traverse(child)
                        
            traverse(body)
            return "\n\n".join(lines)
            
    except Exception as e:
        import traceback
        return f"Error: {str(e)}\n{traceback.format_exc()}"

def get_paragraph_text(p_elem, namespaces):
    text_parts = []
    
    is_heading = False
    heading_prefix = ""
    
    pPr = p_elem.find('w:pPr', namespaces)
    if pPr is not None:
        pStyle = pPr.find('w:pStyle', namespaces)
        if pStyle is not None:
            style_val = pStyle.get('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}val')
            if style_val and ('Heading' in style_val or 'heading' in style_val):
                is_heading = True
                try:
                    level = int(''.join(filter(str.isdigit, style_val)))
                except ValueError:
                    level = 1
                heading_prefix = '#' * min(level, 6) + ' '
                
    for r in p_elem.findall('.//w:r', namespaces):
        t_elems = r.findall('w:t', namespaces)
        for t in t_elems:
            if t.text:
                text_parts.append(t.text)
                
    text = "".join(text_parts)
    if is_heading:
        return heading_prefix + text
    return text

def get_table_text(tbl_elem, namespaces):
    rows_data = []
    for tr in tbl_elem.findall('w:tr', namespaces):
        row_cells = []
        for tc in tr.findall('w:tc', namespaces):
            # For each cell, traverse recursively to get paragraphs/nested elements
            cell_lines = []
            for p in tc.findall('.//w:p', namespaces):
                p_text = get_paragraph_text(p, namespaces)
                if p_text.strip():
                    cell_lines.append(p_text)
            row_cells.append(" ".join(cell_lines))
        if any(cell.strip() for cell in row_cells):
            rows_data.append(" | ".join(row_cells))
            
    if not rows_data:
        return ""
        
    table_lines = []
    table_lines.append("| " + rows_data[0] + " |")
    col_count = len(rows_data[0].split('|'))
    table_lines.append("|" + "---| " * col_count)
    for row in rows_data[1:]:
        table_lines.append("| " + row + " |")
        
    return "\n".join(table_lines)

if __name__ == '__main__':
    srs_path = r"c:\Users\Justine Filip\Desktop\EvacSense\SRS FOR EVACSENSE (4).docx"
    sdd_path = r"c:\Users\Justine Filip\Desktop\EvacSense\SDD EvacSens .docx"
    
    print("Running full extraction for SRS...")
    srs_text = extract_docx_text_full(srs_path)
    with open("srs_extracted_full.md", "w", encoding="utf-8") as f:
        f.write(srs_text)
    print("SRS Extracted. Length:", len(srs_text))
    
    print("Running full extraction for SDD...")
    sdd_text = extract_docx_text_full(sdd_path)
    with open("sdd_extracted_full.md", "w", encoding="utf-8") as f:
        f.write(sdd_text)
    print("SDD Extracted. Length:", len(sdd_text))
