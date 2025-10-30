import { BaseAgent } from '@multi-agent/agent-framework';
import type { AgentContext, AgentMessage } from '@multi-agent/agent-framework';
import type { UnitTestPlan, UnitTestRequestPayload, UnitTestResponsePayload } from './types';
import { UnitTestRunner } from './unit-test-runner';

export interface UnitTestingAgentDependencies {
  createRunner: (plan: UnitTestPlan) => UnitTestRunner;
}

const defaultDependencies: UnitTestingAgentDependencies = {
  createRunner: (plan) => new UnitTestRunner(plan),
};

export class UnitTestingAgent extends BaseAgent {
  constructor(
    options: { id?: string; name?: string } = {},
    private readonly dependencies: UnitTestingAgentDependencies = defaultDependencies,
  ) {
    super({
      id: options.id ?? 'unit-testing-agent',
      name: options.name ?? 'Unit Testing Agent',
      supportedTestTypes: ['unit'],
    });
  }

  async handleMessage(message: AgentMessage, context: AgentContext): Promise<void> {
    if (message.type !== 'request') {
      return;
    }

    const payload = message.payload as UnitTestRequestPayload;

    if (payload?.action !== 'run-plan') {
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
      } satisfies UnitTestResponsePayload,
    });

    await context.sendMessage(response);
  }
}
