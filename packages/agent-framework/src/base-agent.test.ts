import { describe, expect, it, vi } from 'vitest';
import type { AgentMessage } from '@multi-agent/shared-types';
import { AgentFactory } from './agent-factory';
import { AgentRegistry } from './agent-registry';
import { BaseAgent } from './base-agent';

class TestAgent extends BaseAgent {
  public received: AgentMessage[] = [];

  constructor() {
    super({ id: 'test-agent', name: 'Test Agent', supportedTestTypes: ['unit'] });
  }

  handleMessage(message: AgentMessage): void {
    this.received.push(message);
  }

  createResponse(to: string, payload: unknown): AgentMessage {
    // @ts-expect-error - accessing protected helper for test verification
    return this.createMessage({ to, type: 'response', payload });
  }
}

describe('BaseAgent', () => {
  it('tracks supported test types', () => {
    const agent = new TestAgent();

    expect(agent.supportsTestType('unit')).toBe(true);
    expect(agent.supportsTestType('integration')).toBe(false);
  });

  it('creates response messages with metadata', () => {
    const agent = new TestAgent();
    const response = agent.createResponse('orchestrator', { ok: true });

    expect(response.from).toBe(agent.id);
    expect(response.to).toBe('orchestrator');
    expect(response.type).toBe('response');
    expect(response.id).toBeDefined();
  });
});

describe('AgentRegistry', () => {
  it('registers and retrieves agents', () => {
    const registry = new AgentRegistry();
    const agent = new TestAgent();

    registry.register(agent);
    expect(registry.get(agent.id)).toBe(agent);
    expect(registry.findByTestType('unit')).toContain(agent);

    registry.unregister(agent.id);
    expect(registry.get(agent.id)).toBeUndefined();
  });

  it('prevents duplicate agent registrations', () => {
    const registry = new AgentRegistry();
    const agent = new TestAgent();

    registry.register(agent);
    expect(() => registry.register(agent)).toThrowError(/already registered/);
  });
});

describe('AgentFactory', () => {
  it('creates agents using registered constructors', () => {
    const factory = new AgentFactory();
    const spy = vi.fn(() => new TestAgent());

    factory.register('unit', spy);

    const instance = factory.create('unit');

    expect(instance.supportsTestType('unit')).toBe(true);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('throws when requesting unknown agent types', () => {
    const factory = new AgentFactory();

    expect(() => factory.create('integration')).toThrowError(/No agent registered/);
  });
});
