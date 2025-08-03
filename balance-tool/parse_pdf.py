# parse_pdf.py
import fitz  # PyMuPDF
import sys
import json
import re

pdf_path = sys.argv[1]

doc = fitz.open(pdf_path)
text = ""
for page in doc:
    text += page.get_text()

# Extract fields with regex
def extract(pattern, text):
    match = re.search(pattern, text, re.IGNORECASE)
    if match:
        return float(match.group(1).replace(",", ""))
    return None

data = {
    "company_id": 1,
    "year": 2024,
    "revenue": extract(r"Total\s+Income[^\d]*(\d[\d,\.]+)", text),
    "profit": extract(r"Profit\s+(?:after\s+tax|for\s+the\s+year)[^\d]*(\d[\d,\.]+)", text),
    "assets": extract(r"Total\s+Assets[^\d]*(\d[\d,\.]+)", text),
    "liabilities": extract(r"Total\s+Liabilities[^\d]*(\d[\d,\.]+)", text),
    "growth": extract(r"Growth\s+rate[^\d]*(\d{1,2}\.\d{1,2})", text)
}

print(json.dumps(data))
