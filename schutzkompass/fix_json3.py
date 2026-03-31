import json, re

path = 'packages/compliance-content/nis2/policies/index.json'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# The problem: « (was „) followed by text and then a plain " that should be »
# Replace all occurrences of «...» where the closing is a raw " 
# Pattern: « followed by word chars/spaces, then "
# We need to find « ... " and replace the " with »
result = []
i = 0
while i < len(content):
    if content[i] == '\u00AB':
        # Found «, now find the matching closing " 
        j = i + 1
        # Skip until we find a " (U+0022) that's the closing of this quoted phrase
        while j < len(content) and content[j] != '"' and content[j] != '\u00BB':
            j += 1
        if j < len(content) and content[j] == '"':
            # Replace this " with »
            result.append(content[i:j])
            result.append('\u00BB')
            i = j + 1
            continue
    result.append(content[i])
    i += 1

content = ''.join(result)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

# Validate
try:
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    print(f'Valid JSON! {len(data["policies"])} policies')
    for p in data['policies']:
        sections = p.get('sections', [])
        print(f'  {p["id"]}: {len(sections)} sections')
except json.JSONDecodeError as e:
    print(f'Still broken at pos {e.pos}, line {e.lineno}, col {e.colno}: {e.msg}')
    with open(path, 'r', encoding='utf-8') as f:
        c = f.read()
    start = max(0, e.pos - 40)
    end = min(len(c), e.pos + 40)
    print(f'Context around error: {repr(c[start:end])}')
