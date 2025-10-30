# Agent Development Guide

Agents are implemented as Node.js services built on top of the shared `agent-framework` package.

- Extend the `BaseAgent` class to implement specialized testing behavior.
- Register agents through the `AgentRegistry` so they can be discovered by the orchestrator.
- Use the message broker utilities to exchange structured messages defined in `packages/shared-types`.
- Write Vitest unit tests alongside each agent to validate request handling and reporting workflows.
