import json

path = 'packages/compliance-content/nis2/policies/index.json'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Find all unescaped quotes inside JSON string values that are problematic
# Replace « ... " patterns with « ... »  (fix the closing quote)
# But more precisely, we need to find the actual problematic spots

# Let's find all occurrences of « followed by text and then a raw "
import re

# The safe approach: replace all inner double-quotes that appear after «
# by scanning for «...» patterns where the closing is a raw "
# Actually, let's just replace the specific known problematic strings
content = content.replace('\u00ABSicherheitsvorfall"', '\u00ABSicherheitsvorfall\u00BB')
content = content.replace('\u00ABSecurity Awareness ', '\u00ABSecurity Awareness ')

# Also check for any other « that has a raw " as closing
# Let's find them
lines = content.split('\n')
for i, line in enumerate(lines):
    if '\u00AB' in line:
        # Check if there's a raw " after « that's not the line-ending quote
        idx = line.find('\u00AB')
        while idx >= 0:
            # Find closing
            end = line.find('"', idx + 1)
            # Check if this " is the end of the JSON value (followed by newline or comma)
            if end >= 0 and end < len(line) - 1:
                next_char = line[end + 1] if end + 1 < len(line) else ''
                # If the next char is NOT a comma, colon, or closing brace, it might be a problem
            idx = line.find('\u00AB', idx + 1)

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
    for i in range(max(0, e.pos - 30), min(len(c), e.pos + 30)):
        ch = c[i]
        marker = ' <---' if i == e.pos else ''
        print(f'  pos {i}: U+{ord(ch):04X} = {repr(ch)}{marker}')
