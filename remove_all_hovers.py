import os
import re

directories = ['frontend/app', 'frontend/components']

patterns_to_remove = [
    # Remove all hover classes
    r'\b(?:group-|dark:)*hover:[a-zA-Z0-9_/\-\[\]%\.]+',
    # Remove Framer Motion whileHover props
    r'whileHover=\{\{.*?\}\}'
]

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    original_content = content
    for pattern in patterns_to_remove:
        content = re.sub(pattern, '', content, flags=re.DOTALL if 'whileHover' in pattern else 0)
    
    # Clean up excess spaces that might have been left behind
    content = re.sub(r' {2,}', ' ', content)
    content = re.sub(r' \]', ']', content)
    content = re.sub(r' "', '"', content)
    content = re.sub(r' \'', '\'', content)
    content = re.sub(r' `', '`', content)
    
    if content != original_content:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Updated {filepath}")

for d in directories:
    for root, _, files in os.walk(d):
        for file in files:
            if file.endswith('.tsx') or file.endswith('.ts'):
                process_file(os.path.join(root, file))

print("Done.")
