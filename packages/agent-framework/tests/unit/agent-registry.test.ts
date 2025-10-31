import { describe, it, expect, beforeEach } from 'vitest';
import { AgentRegistry } from '../../src/agent-registry';
import { BaseAgent, type BaseAgentOptions } from '../../src/base-agent';

class MockAgent extends BaseAgent {
  constructor(options: BaseAgentOptions) {
    super(options);
  }
  handleMessage() {}
}

describe('AgentRegistry', () => {
  let registry: AgentRegistry;
  const agent1 = new MockAgent({ id: 'agent-1', name: 'Agent One', supportedTestTypes: ['A', 'B'] });
  const agent2 = new MockAgent({ id: 'agent-2', name: 'Agent Two', supportedTestTypes: ['B', 'C'] });

  beforeEach(() => {
    registry = new AgentRegistry();
    registry.register(agent1);
    registry.register(agent2);
  });

  it('should register agents', () => {
    expect(registry.list()).toHaveLength(2);
    expect(registry.get('agent-1')).toBe(agent1);
  });

  it('should throw an error if an agent with the same id is already registered', () => {
    const duplicateAgent = new MockAgent({ id: 'agent-1', name: 'Duplicate', supportedTestTypes: [] });
    expect(() => registry.register(duplicateAgent)).toThrowError('Agent with id agent-1 is already registered');
  });

  it('should unregister an agent', () => {
    registry.unregister('agent-1');
    expect(registry.get('agent-1')).toBeUndefined();
    expect(registry.list()).toHaveLength(1);
  });

  it('should get an agent by id', () => {
    expect(registry.get('agent-2')).toBe(agent2);
    expect(registry.get('non-existent')).toBeUndefined();
  });

  it('should list all registered agents', () => {
    const agentList = registry.list();
    expect(agentList).toContain(agent1);
    expect(agentList).toContain(agent2);
  });

  it('should find agents by test type', () => {
    const agentsForB = registry.findByTestType('B');
    expect(agentsForB).toHaveLength(2);
    expect(agentsForB).toContain(agent1);
    expect(agentsForB).toContain(agent2);

    const agentsForC = registry.findByTestType('C');
    expect(agentsForC).toHaveLength(1);
    expect(agentsForC).toContain(agent2);

    const agentsForD = registry.findByTestType('D');
    expect(agentsForD).toHaveLength(0);
  });
});
