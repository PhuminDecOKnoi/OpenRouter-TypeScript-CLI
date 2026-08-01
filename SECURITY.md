# Security Policy

## Scope

This repository is a TypeScript CLI client for the OpenRouter API. Security reports should cover credential handling, request construction, response processing, logging, dependency use, or behavior that may expose user data or secrets.

## Reporting

Do not post API keys, request payloads containing sensitive data, or exploit details in a public issue. Use a private GitHub security report when available.

## Security Baseline

- Never commit `.env`, API keys, tokens, private keys, or provider credentials.
- Keep `.env.example` limited to placeholders.
- Treat terminal input and model output as untrusted data.
- Do not execute model-generated code or shell commands automatically.
- Avoid logging full prompts, responses, headers, or credentials when they may contain sensitive information.
- Validate HTTP status, content type, expected response shape, and missing fields.
- Apply timeouts and clear error handling for network failures and rate limits.
- Review dependency updates and lockfile changes.
- Do not claim that model-provided citations are verified unless the application independently validates them.
- Warn users that prompts may be processed by external model providers under their own terms and privacy policies.

## Supported Versions

Security fixes are prioritized for the current main branch and the documented Node.js / TypeScript baseline.
