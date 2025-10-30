# Getting Started

This guide walks through setting up the multi-agent testing monorepo locally.

1. Install Node.js 20 or newer.
2. Clone the repository and run `npm install` to install workspace dependencies.
3. Review `docker/docker-compose.yml` and start the data services with `docker compose up -d`.
4. Apply `docker/schema.sql` to the PostgreSQL instance to create baseline tables.
5. Explore the packages under `packages/` and the orchestrator/agent apps under `apps/` to begin development.
