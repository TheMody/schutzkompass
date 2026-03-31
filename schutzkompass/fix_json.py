import json

path = 'packages/compliance-content/nis2/policies/index.json'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace German typographic quotes that break JSON parsing
# U+201E „ (double low-9 quotation mark) -> «
# U+201C " (left double quotation mark) -> »  
# U+201D " (right double quotation mark) -> »
content = content.replace('\u201E', '\u00AB')
content = content.replace('\u201C', '\u00BB')
content = content.replace('\u201D', '\u00BB')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

# Validate
with open(path, 'r', encoding='utf-8') as f:
    data = json.load(f)

print(f'Valid JSON! {len(data["policies"])} policies')
for p in data['policies']:
    sections = p.get('sections', [])
    print(f'  {p["id"]}: {len(sections)} sections')
