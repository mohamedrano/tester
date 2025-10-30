# Workflow Guide

1. The orchestrator receives testing requests from external systems.
2. Requests are normalized into shared message types from `packages/shared-types`.
3. The orchestrator dispatches the work to specialized agents using the message broker abstractions.
4. Agents execute their respective test suites and publish results back to the broker.
5. Aggregated results are persisted to PostgreSQL and surfaced through reporting tooling.
