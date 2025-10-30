import { randomUUID } from 'crypto';
import { AgentFactory } from '@multi-agent/agent-framework';
import type { AgentContext, AgentMessage, BaseAgent } from '@multi-agent/agent-framework';
import { InMemoryMessageBroker, createEnvelope } from '@multi-agent/message-broker';
import type { ReportEnvelope } from '@multi-agent/reporting-agent';

interface RegisteredAgent {
  agent: BaseAgent;
  channel: string;
}

function createAgentContext(broker: InMemoryMessageBroker): AgentContext {
  return {
    sendMessage: async (message) => {
      broker.publish(message.to, createEnvelope(message, message.payload));
    },
  };
}

function extractReport(message: AgentMessage): ReportEnvelope | undefined {
  const payload = message.payload as { action?: string; report?: { summary: ReportEnvelope['result'] } };

  if (payload?.action === 'report' && payload.report?.summary) {
    return {
      sourceAgent: message.from,
      result: payload.report.summary,
    } satisfies ReportEnvelope;
  }

  return undefined;
}

export class TestingOrchestrator {
  private readonly factory = new AgentFactory();
  private readonly broker = new InMemoryMessageBroker();
  private readonly agents = new Map<string, RegisteredAgent>();
  private reportingAgent?: RegisteredAgent;

  registerAgent(testType: string, creator: () => BaseAgent): void {
    this.factory.register(testType, creator);
    const agent = creator();
    this.attachAgent(agent);
    this.agents.set(testType, { agent, channel: agent.id });
  }

  registerReportingAgent(creator: () => BaseAgent): void {
    const agent = creator();
    this.attachAgent(agent);
    this.reportingAgent = { agent, channel: agent.id };
  }

  async execute(testType: string, payload: unknown): Promise<AgentMessage> {
    const registered = this.agents.get(testType);

    if (!registered) {
      throw new Error(`No agent registered for test type ${testType}`);
    }

    const response = await this.requestResponse(registered.channel, payload);

    const report = extractReport(response);
    if (report && this.reportingAgent) {
      const notification: AgentMessage = {
        id: randomUUID(),
        from: 'orchestrator',
        to: this.reportingAgent.channel,
        type: 'notification',
        payload: {
          action: 'aggregate',
          report,
        },
        priority: 'medium',
        timestamp: Date.now(),
      };
      this.broker.publish(notification.to, createEnvelope(notification, notification.payload));
    }

    return response;
  }

  async fetchSummary(): Promise<AgentMessage> {
    if (!this.reportingAgent) {
      throw new Error('Reporting agent has not been registered');
    }

    return this.requestResponse(this.reportingAgent.channel, { action: 'summary' });
  }

  private attachAgent(agent: BaseAgent): void {
    const context = createAgentContext(this.broker);

    this.broker.subscribe(agent.id, async (envelope) => {
      await agent.handleMessage(envelope.message, context);
    });
  }

  private async requestResponse(channel: string, payload: unknown): Promise<AgentMessage> {
    const responseChannel = 'orchestrator';
    const message: AgentMessage = {
      id: randomUUID(),
      from: responseChannel,
      to: channel,
      type: 'request',
      payload,
      priority: 'medium',
      timestamp: Date.now(),
    };

    const envelope = createEnvelope(message, payload);
    const responseEnvelope = await this.broker.requestResponse(channel, responseChannel, envelope);
    return responseEnvelope.message;
  }
}
