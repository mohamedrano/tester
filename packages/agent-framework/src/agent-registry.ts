import type { BaseAgent } from './base-agent';

export class AgentRegistry {
  private readonly agents = new Map<string, BaseAgent>();

  register(agent: BaseAgent): void {
    if (this.agents.has(agent.id)) {
      throw new Error(`Agent with id ${agent.id} is already registered`);
    }

    this.agents.set(agent.id, agent);
  }

  unregister(agentId: string): void {
    this.agents.delete(agentId);
  }

  get(agentId: string): BaseAgent | undefined {
    return this.agents.get(agentId);
  }

  list(): BaseAgent[] {
    return Array.from(this.agents.values());
  }

  findByTestType(testType: string): BaseAgent[] {
    return this.list().filter((agent) => agent.supportsTestType(testType));
  }
}
