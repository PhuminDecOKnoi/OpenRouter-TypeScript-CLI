# Contributing Guide

Thank you for improving the OpenRouter TypeScript CLI.

## Contribution Standards

- Keep TypeScript strict and avoid unnecessary `any`.
- Separate CLI input, API client logic, response formatting, and error handling.
- Never commit real API keys or sensitive prompts.
- Update `.env.example` only with placeholders.
- Validate API responses before reading nested fields.
- Handle non-2xx responses, rate limits, timeouts, malformed JSON, and missing source metadata.
- Do not present model-generated sources as independently verified facts.
- Keep terminal output readable and avoid exposing authorization headers or full sensitive payloads.
- Update README when commands, environment variables, output fields, or provider behavior change.

## Recommended Checks

```bash
npm install
npm run build
npm start
```

Also verify:

- no secrets are present;
- TypeScript compiles without errors;
- error messages are understandable;
- source and model metadata are labelled accurately;
- lockfile changes are intentional.

## Commit Messages

```text
feat: add response metadata display
fix: handle OpenRouter rate-limit response
security: redact sensitive request details
docs: clarify source verification limits
refactor: separate API client from CLI
```

## License

By contributing, you confirm that the material may be distributed under the repository license and does not contain unauthorized confidential or third-party content.
