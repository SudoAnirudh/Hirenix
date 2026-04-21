import os
import re

directories = ['frontend/app', 'frontend/components']

patterns_to_remove = [
    r'\bhover:text-[a-zA-Z0-9_/-]+\b',
    r'\bgroup-hover:text-[a-zA-Z0-9_/-]+\b',
    r'\bhover:bg-[a-zA-Z0-9_/-]+(/[0-9]+)?\b',
    r'\bgroup-hover:bg-[a-zA-Z0-9_/-]+(/[0-9]+)?\b',
    r'\bhover:border-[a-zA-Z0-9_/-]+(/[0-9]+)?\b',
    r'\bgroup-hover:border-[a-zA-Z0-9_/-]+(/[0-9]+)?\b',
    r'\bdark:hover:bg-[a-zA-Z0-9_/-]+(/[0-9]+)?\b',
    r'\bdark:hover:text-[a-zA-Z0-9_/-]+(/[0-9]+)?\b',
]

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    original_content = content
    for pattern in patterns_to_remove:
        content = re.sub(pattern, '', content)
    
    # Clean up double spaces created by removal
    content = re.sub(r' {2,}', ' ', content)
    # Clean up spaces before closing quotes
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
