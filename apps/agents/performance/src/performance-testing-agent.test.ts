import { describe, expect, test, vi } from 'vitest';
import type { AgentContext, AgentMessage } from '@multi-agent/agent-framework';
import { PerformanceTestingAgent } from './performance-testing-agent';
import { PerformanceTestRunner } from './performance-test-runner';
import type {
  PerformanceTestPlan,
  PerformanceTestRequestPayload,
  PerformanceTestResponsePayload,
} from './types';

describe('PerformanceTestingAgent', () => {
  test('measures performance targets against budgets', async () => {
    const plan: PerformanceTestPlan = {
      suite: 'critical-path',
      targets: [
        {
          name: 'fast operation',
          iterations: 10,
          budgetMs: 10,
          run: () => {
            const arr = Array.from({ length: 100 }, (_, index) => index);
            arr.reverse();
          },
        },
      ],
    };

    const runner = new PerformanceTestRunner(plan);
    const createRunner = vi.fn().mockReturnValue(runner);
    const agent = new PerformanceTestingAgent({}, { createRunner });
    const sent: AgentMessage[] = [];
    const context: AgentContext = {
      sendMessage: async (message) => sent.push(message),
    };

    const message: AgentMessage = {
      id: 'performance-request',
      from: 'orchestrator',
      to: agent.id,
      type: 'request',
      payload: { action: 'measure-performance', plan } satisfies PerformanceTestRequestPayload,
      priority: 'medium',
      timestamp: Date.now(),
    };

    await agent.handleMessage(message, context);

    expect(createRunner).toHaveBeenCalledWith(plan);
    expect(sent).toHaveLength(1);
    const payload = sent[0].payload as PerformanceTestResponsePayload;
    expect(payload.action).toBe('report');
    expect(payload.report.details[0].iterations).toBe(10);
  });
});
