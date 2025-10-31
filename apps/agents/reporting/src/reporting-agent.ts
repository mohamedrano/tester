import { BaseAgent } from '@multi-agent/agent-framework';
import type { AgentContext, AgentMessage } from '@multi-agent/agent-framework';
import type {
  ReportEnvelope,
  ReportingRequestPayload,
  ReportingResponsePayload,
  ReportingSummaryRequestPayload,
} from './types';
import { ReportingStore } from './reporting-store';

export interface ReportingAgentDependencies {
  store: ReportingStore;
}

const defaultDependencies: ReportingAgentDependencies = {
  store: new ReportingStore(),
};

function isAggregate(payload: unknown): payload is ReportingRequestPayload {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    (payload as ReportingRequestPayload).action === 'aggregate'
  );
}

function isSummary(payload: unknown): payload is ReportingSummaryRequestPayload {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    (payload as ReportingSummaryRequestPayload).action === 'summary'
  );
}

export class ReportingAgent extends BaseAgent {
  constructor(
    options: { id?: string; name?: string } = {},
    private readonly dependencies: ReportingAgentDependencies = defaultDependencies,
  ) {
    super({
      id: options.id ?? 'reporting-agent',
      name: options.name ?? 'Reporting Agent',
      supportedTestTypes: ['reporting'],
    });
  }

  async handleMessage(message: AgentMessage, context: AgentContext): Promise<void> {
    if (message.type === 'notification' && isAggregate(message.payload)) {
      this.dependencies.store.add(message.payload.report.result);
      return;
    }

    if (message.type === 'request' && isSummary(message.payload)) {
      const response = this.createSummaryResponse(message.from);
      await context.sendMessage(response);
    }
  }

  private createSummaryResponse(target: string): AgentMessage {
    const results = this.dependencies.store.all();
    const totals = this.dependencies.store.totals();

    return this.createMessage({
      to: target,
      type: 'response',
      payload: {
        action: 'summary',
        results,
        totals,
      } satisfies ReportingResponsePayload,
    });
  }
}
