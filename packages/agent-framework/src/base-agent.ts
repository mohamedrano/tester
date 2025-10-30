import { randomUUID } from 'crypto';
import type { AgentMessage, AgentMessagePriority } from '@multi-agent/shared-types';

export interface BaseAgentOptions {
  id: string;
  name: string;
  supportedTestTypes: string[];
}

export interface AgentContext {
  sendMessage: (message: AgentMessage) => Promise<void> | void;
}

export abstract class BaseAgent {
  protected constructor(private readonly options: BaseAgentOptions) {}

  get id(): string {
    return this.options.id;
  }

  get name(): string {
    return this.options.name;
  }

  get supportedTestTypes(): string[] {
    return [...this.options.supportedTestTypes];
  }

  supportsTestType(testType: string): boolean {
    return this.options.supportedTestTypes.includes(testType);
  }

  protected createMessage(
    overrides: Partial<AgentMessage> &
      Pick<AgentMessage, 'to' | 'type' | 'payload'> & { priority?: AgentMessagePriority },
  ): AgentMessage {
    return {
      id: overrides.id ?? randomUUID(),
      from: this.id,
      to: overrides.to,
      type: overrides.type,
      payload: overrides.payload,
      priority: overrides.priority ?? 'medium',
      timestamp: overrides.timestamp ?? Date.now(),
    };
  }

  abstract handleMessage(message: AgentMessage, context: AgentContext): Promise<void> | void;
}
