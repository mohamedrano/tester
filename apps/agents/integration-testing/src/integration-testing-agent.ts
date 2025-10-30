import { BaseAgent } from '@multi-agent/agent-framework';
import type { AgentContext, AgentMessage } from '@multi-agent/agent-framework';
import type {
  IntegrationTestPlan,
  IntegrationTestRequestPayload,
  IntegrationTestResponsePayload,
} from './types';
import { IntegrationTestRunner } from './integration-test-runner';

export interface IntegrationTestingAgentDependencies {
  createRunner: (plan: IntegrationTestPlan) => IntegrationTestRunner;
}

const defaultDependencies: IntegrationTestingAgentDependencies = {
  createRunner: (plan) => new IntegrationTestRunner(plan),
};

export class IntegrationTestingAgent extends BaseAgent {
  constructor(
    options: { id?: string; name?: string } = {},
    private readonly dependencies: IntegrationTestingAgentDependencies = defaultDependencies,
  ) {
    super({
      id: options.id ?? 'integration-testing-agent',
      name: options.name ?? 'Integration Testing Agent',
      supportedTestTypes: ['integration'],
    });
  }

  async handleMessage(message: AgentMessage, context: AgentContext): Promise<void> {
    if (message.type !== 'request') {
      return;
    }

    const payload = message.payload as IntegrationTestRequestPayload;

    if (payload?.action !== 'validate-contract') {
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
      } satisfies IntegrationTestResponsePayload,
    });

    await context.sendMessage(response);
  }
}
