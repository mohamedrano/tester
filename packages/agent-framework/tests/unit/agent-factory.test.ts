import { describe, it, expect } from 'vitest';
import { AgentFactory } from '../../src/agent-factory';
import { BaseAgent, type BaseAgentOptions } from '../../src/base-agent';

class MockAgent extends BaseAgent {
  constructor(options: BaseAgentOptions) {
    super(options);
  }
  handleMessage() {}
}

describe('AgentFactory', () => {
  it('should register and create an agent successfully', () => {
    const factory = new AgentFactory();
    const agentCreator = () => new MockAgent({ id: 'mock-1', name: 'Mock Agent', supportedTestTypes: ['mock'] });

    factory.register('mock-test', agentCreator);
    const agent = factory.create('mock-test');

    expect(agent).toBeInstanceOf(MockAgent);
    expect(agent.id).toBe('mock-1');
  });

  it('should throw an error if no agent is registered for the given test type', () => {
    const factory = new AgentFactory();
    expect(() => factory.create('non-existent-type')).toThrowError(
      'No agent registered for test type non-existent-type'
    );
  });
});
