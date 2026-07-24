import ast

with open('backend/routers/cover_letter.py', 'r') as f:
    source = f.read()

ast.parse(source)
print("Syntax OK")
