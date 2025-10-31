import { describe, it, expect, beforeEach } from 'vitest';
import fc from 'fast-check';
import { BaseAgent, type BaseAgentOptions, type AgentContext } from '../../src/base-agent';
import type { AgentMessage } from '@multi-agent/shared-types';
import { mock, instance, verify, anything, capture } from 'ts-mockito';

// Concrete implementation of the abstract BaseAgent for testing purposes
class TestAgent extends BaseAgent {
  constructor(options: BaseAgentOptions) {
    super(options);
  }

  // Expose protected method for testing
  public testCreateMessage(overrides: Partial<AgentMessage> & Pick<AgentMessage, 'to' | 'type' | 'payload'>) {
    return this.createMessage(overrides);
  }

  handleMessage(message: AgentMessage, context: AgentContext): void {
    // This is an abstract method and its implementation is not tested here.
  }
}

describe('BaseAgent', () => {
  describe('Getters', () => {
    it('should return the correct values from getters', () => {
      const options = { id: 'getter-agent', name: 'Getter Agent', supportedTestTypes: ['get', 'set'] };
      const agent = new TestAgent(options);

      expect(agent.id).toBe(options.id);
      expect(agent.name).toBe(options.name);
      expect(agent.supportedTestTypes).toEqual(options.supportedTestTypes);
    });
  });

  describe('supportsTestType', () => {
    it('should return true if the testType is in the supportedTestTypes array', () => {
      fc.assert(
        fc.property(
          fc.array(fc.string(), { minLength: 1 }),
          fc.string(),
          (supportedTestTypes, testType) => {
            const extendedSupportedTestTypes = [...new Set([...supportedTestTypes, testType])];
            const agent = new TestAgent({ id: 'test', name: 'Test', supportedTestTypes: extendedSupportedTestTypes });
            return agent.supportsTestType(testType);
          }
        )
      );
    });

    it('should return false if the testType is not in the supportedTestTypes array', () => {
      fc.assert(
        fc.property(
          fc.array(fc.string()),
          fc.string(),
          (supportedTestTypes, testType) => {
            const filteredSupportedTestTypes = supportedTestTypes.filter(t => t !== testType);
            const agent = new TestAgent({ id: 'test', name: 'Test', supportedTestTypes: filteredSupportedTestTypes });
            return !agent.supportsTestType(testType);
          }
        )
      );
    });
  });

  describe('createMessage', () => {
    let agent: TestAgent;

    beforeEach(() => {
      agent = new TestAgent({
        id: 'agent-123',
        name: 'MyTestAgent',
        supportedTestTypes: ['unit'],
      });
    });

    it('should correctly construct a message with default values', () => {
      const message = agent.testCreateMessage({
        to: 'recipient-456',
        type: 'request',
        payload: { data: 'hello' },
      });

      expect(message.id).toBeTypeOf('string');
      expect(message.from).toBe('agent-123');
      expect(message.to).toBe('recipient-456');
      expect(message.type).toBe('request');
      expect(message.payload).toEqual({ data: 'hello' });
      expect(message.priority).toBe('medium');
      expect(message.timestamp).toBeTypeOf('number');
    });

    it('should allow overriding default values', () => {
      const now = Date.now();
      const message = agent.testCreateMessage({
        id: 'custom-id',
        to: 'recipient-789',
        type: 'notification',
        payload: { info: 'world' },
        priority: 'high',
        timestamp: now,
      });

      expect(message.id).toBe('custom-id');
      expect(message.from).toBe('agent-123');
      expect(message.priority).toBe('high');
      expect(message.timestamp).toBe(now);
    });
  });
});
