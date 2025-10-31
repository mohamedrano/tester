import { BaseAgent } from '@multi-agent/agent-framework';
import type { AgentContext, AgentMessage } from '@multi-agent/agent-framework';
import type {
  MaintenanceTestPlan,
  MaintenanceTestRequestPayload,
  MaintenanceTestResponsePayload,
} from './types';
import { MaintenanceTestRunner } from './maintenance-test-runner';

export interface MaintenanceTestingAgentDependencies {
  createRunner: (plan: MaintenanceTestPlan) => MaintenanceTestRunner;
}

const defaultDependencies: MaintenanceTestingAgentDependencies = {
  createRunner: (plan) => new MaintenanceTestRunner(plan),
};

export class MaintenanceTestingAgent extends BaseAgent {
  constructor(
    options: { id?: string; name?: string } = {},
    private readonly dependencies: MaintenanceTestingAgentDependencies = defaultDependencies,
  ) {
    super({
      id: options.id ?? 'maintenance-testing-agent',
      name: options.name ?? 'Maintenance Testing Agent',
      supportedTestTypes: ['maintenance'],
    });
  }

  async handleMessage(message: AgentMessage, context: AgentContext): Promise<void> {
    if (message.type !== 'request') {
      return;
    }

    const payload = message.payload as MaintenanceTestRequestPayload;

    if (payload?.action !== 'evaluate-maintainability') {
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
      } satisfies MaintenanceTestResponsePayload,
    });

    await context.sendMessage(response);
  }
}
