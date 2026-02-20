# Security Policy

## Supported Versions

Provide information about supported versions of Hirenix that currently receive security updates.

| Version | Supported          |
| ------- | ------------------ |
| v1.0.x  | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of Hirenix seriously. If you have discovered a vulnerability, please report it privately rather than creating a public issue.

To report a security vulnerability:
1. Please do not open a public issue on GitHub.
2. Privately send an email to the repository maintainer (you will need to provide your contact email here).
3. Include detailed steps to reproduce the vulnerability.
4. If applicable, suggest a potential fix or mitigation.

The project maintainer will review the report and respond as soon as possible, typically within 48 hours. Please allow reasonable time for the maintainer to investigate and release a patch before disclosing the vulnerability publicly.

## Security Best Practices
- Never commit `.env` or configuration files containing secrets or API keys (e.g., Supabase keys, OpenAI API keys).
- Keep your dependencies updated to their latest secure versions using tools like `npm audit` or `dependabot`.
- Use authorized authentication methods for any administrative API endpoints.
