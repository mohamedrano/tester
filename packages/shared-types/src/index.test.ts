import { describe, expect, it } from 'vitest';
import type { AgentMessage, TestResult } from './index';

describe('shared types', () => {
  it('allows constructing a valid AgentMessage shape', () => {
    const message: AgentMessage = {
      id: 'msg-1',
      from: 'orchestrator',
      to: 'unit-testing-agent',
      type: 'request',
      payload: { suite: 'unit' },
      priority: 'high',
      timestamp: Date.now(),
    };

    expect(message.type).toBe('request');
    expect(message.priority).toBe('high');
  });

  it('represents test results coherently', () => {
    const result: TestResult = {
      agentId: 'unit-testing-agent',
      testType: 'unit',
      passed: 10,
      failed: 0,
      duration: 1234,
      timestamp: Date.now(),
    };

    expect(result.failed).toBe(0);
    expect(result.duration).toBeGreaterThan(0);
  });
});
