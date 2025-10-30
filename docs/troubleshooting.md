# Troubleshooting

- Ensure Docker services are running with `docker compose ps` when agents cannot reach PostgreSQL or Redis.
- Verify environment variables, especially database credentials, are defined in the agent process.
- Use the message broker health checks to confirm connectivity before running large suites.
- Run `npm run lint` and `npm run test` locally to catch issues before pushing changes.
