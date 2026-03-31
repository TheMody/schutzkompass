path = 'packages/compliance-content/nis2/policies/index.json'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Show chars around position 16996
for i in range(16970, 17020):
    ch = content[i]
    print(f'  pos {i}: U+{ord(ch):04X} = {repr(ch)}')
