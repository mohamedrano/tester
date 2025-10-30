import { BaseAgent } from '@multi-agent/agent-framework';
import type { AgentContext, AgentMessage } from '@multi-agent/agent-framework';
import type {
  SecurityTestPlan,
  SecurityTestRequestPayload,
  SecurityTestResponsePayload,
} from './types';
import { SecurityTestRunner } from './security-test-runner';

export interface SecurityTestingAgentDependencies {
  createRunner: (plan: SecurityTestPlan) => SecurityTestRunner;
}

const defaultDependencies: SecurityTestingAgentDependencies = {
  createRunner: (plan) => new SecurityTestRunner(plan),
};

export class SecurityTestingAgent extends BaseAgent {
  constructor(
    options: { id?: string; name?: string } = {},
    private readonly dependencies: SecurityTestingAgentDependencies = defaultDependencies,
  ) {
    super({
      id: options.id ?? 'security-testing-agent',
      name: options.name ?? 'Security Testing Agent',
      supportedTestTypes: ['security'],
    });
  }

  async handleMessage(message: AgentMessage, context: AgentContext): Promise<void> {
    if (message.type !== 'request') {
      return;
    }

    const payload = message.payload as SecurityTestRequestPayload;

    if (payload?.action !== 'run-security-checks') {
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
      } satisfies SecurityTestResponsePayload,
    });

    await context.sendMessage(response);
  }
}
