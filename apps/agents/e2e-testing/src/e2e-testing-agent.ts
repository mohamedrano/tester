import { BaseAgent } from '@multi-agent/agent-framework';
import type { AgentContext, AgentMessage } from '@multi-agent/agent-framework';
import type { E2ETestPlan, E2ETestRequestPayload, E2ETestResponsePayload } from './types';
import { E2ETestRunner } from './e2e-test-runner';

export interface E2ETestingAgentDependencies {
  createRunner: (plan: E2ETestPlan) => E2ETestRunner;
}

const defaultDependencies: E2ETestingAgentDependencies = {
  createRunner: (plan) => new E2ETestRunner(plan),
};

export class E2ETestingAgent extends BaseAgent {
  constructor(
    options: { id?: string; name?: string } = {},
    private readonly dependencies: E2ETestingAgentDependencies = defaultDependencies,
  ) {
    super({
      id: options.id ?? 'e2e-testing-agent',
      name: options.name ?? 'E2E Testing Agent',
      supportedTestTypes: ['e2e'],
    });
  }

  async handleMessage(message: AgentMessage, context: AgentContext): Promise<void> {
    if (message.type !== 'request') {
      return;
    }

    const payload = message.payload as E2ETestRequestPayload;

    if (payload?.action !== 'execute-scenario') {
      return;
    }

    const runner = this.dependencies.createRunner(payload.plan);
    const report = await runner.run(this.id);

    const response = this.createMessage({
      to: message.from,
      type: 'response',
      payload: {
        action: 'report',
        report,
      } satisfies E2ETestResponsePayload,
    });

    await context.sendMessage(response);
  }
}
