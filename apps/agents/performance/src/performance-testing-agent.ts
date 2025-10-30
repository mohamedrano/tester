import { BaseAgent } from '@multi-agent/agent-framework';
import type { AgentContext, AgentMessage } from '@multi-agent/agent-framework';
import type {
  PerformanceTestPlan,
  PerformanceTestRequestPayload,
  PerformanceTestResponsePayload,
} from './types';
import { PerformanceTestRunner } from './performance-test-runner';

export interface PerformanceTestingAgentDependencies {
  createRunner: (plan: PerformanceTestPlan) => PerformanceTestRunner;
}

const defaultDependencies: PerformanceTestingAgentDependencies = {
  createRunner: (plan) => new PerformanceTestRunner(plan),
};

export class PerformanceTestingAgent extends BaseAgent {
  constructor(
    options: { id?: string; name?: string } = {},
    private readonly dependencies: PerformanceTestingAgentDependencies = defaultDependencies,
  ) {
    super({
      id: options.id ?? 'performance-testing-agent',
      name: options.name ?? 'Performance Testing Agent',
      supportedTestTypes: ['performance'],
    });
  }

  async handleMessage(message: AgentMessage, context: AgentContext): Promise<void> {
    if (message.type !== 'request') {
      return;
    }

    const payload = message.payload as PerformanceTestRequestPayload;

    if (payload?.action !== 'measure-performance') {
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
      } satisfies PerformanceTestResponsePayload,
    });

    await context.sendMessage(response);
  }
}
