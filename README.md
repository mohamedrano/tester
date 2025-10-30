# Multi-Agent Testing System Monorepo

This repository scaffolds a multi-agent testing system composed of orchestrator and specialized testing agents. The monorepo is designed to host shared packages, message broker utilities, and orchestration tooling required to coordinate intelligent testing workflows.

## Project Layout

```
apps/
  orchestrator/
  agents/
    unit-testing/
    integration-testing/
    e2e-testing/
    security/
    performance/
    code-analysis/
    maintenance/
    reporting/
  dashboard/
packages/
  shared-types/
  agent-framework/
  message-broker/
docker/
docs/
scripts/
```

## Getting Started

1. Install Node.js 20 or newer.
2. Install dependencies for the workspace using `npm install`.
3. Run formatting, linting, and tests with the available npm scripts.

## Available Scripts

- `npm run build` – TypeScript build for all packages.
- `npm run lint` – Run ESLint across the workspace.
- `npm run format` – Check formatting with Prettier.
- `npm run test` – Execute Vitest unit tests.

## Documentation

Documentation lives under the `docs/` directory. Initial guides include getting started instructions, agent development guidelines, workflow descriptions, and troubleshooting notes.

## License

This project is distributed under the MIT License. See `LICENSE` for more information.
