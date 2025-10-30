import type { BaseAgent } from './base-agent';

export type AgentConstructor<TAgent extends BaseAgent> = () => TAgent;

export class AgentFactory {
  private readonly creators = new Map<string, AgentConstructor<BaseAgent>>();

  register(testType: string, creator: AgentConstructor<BaseAgent>): void {
    this.creators.set(testType, creator);
  }

  create(testType: string): BaseAgent {
    const creator = this.creators.get(testType);

    if (!creator) {
      throw new Error(`No agent registered for test type ${testType}`);
    }

    return creator();
  }
}
