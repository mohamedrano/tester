import { describe, expect, test, vi } from 'vitest';
import type { AgentContext, AgentMessage } from '@multi-agent/agent-framework';
import { E2ETestingAgent } from './e2e-testing-agent';
import { E2ETestRunner } from './e2e-test-runner';
import type { E2ETestPlan, E2ETestRequestPayload, E2ETestResponsePayload } from './types';

describe('E2ETestingAgent', () => {
  test('runs scenario steps until completion and reports results', async () => {
    const plan: E2ETestPlan = {
      scenario: 'checkout-flow',
      steps: [
        { name: 'open home page', run: () => ({ success: true }) },
        { name: 'add item to cart', run: () => ({ success: true }) },
        { name: 'complete checkout', run: () => ({ success: true }) },
      ],
    };

    const runner = new E2ETestRunner(plan);
    const createRunner = vi.fn().mockReturnValue(runner);
    const agent = new E2ETestingAgent({}, { createRunner });
    const sent: AgentMessage[] = [];
    const context: AgentContext = {
      sendMessage: async (message) => {
        sent.push(message);
      },
    };

    const request: AgentMessage = {
      id: 'e2e-request',
      from: 'orchestrator',
      to: agent.id,
      type: 'request',
      payload: { action: 'execute-scenario', plan } satisfies E2ETestRequestPayload,
      priority: 'high',
      timestamp: Date.now(),
    };

    await agent.handleMessage(request, context);

    expect(createRunner).toHaveBeenCalledWith(plan);
    expect(sent).toHaveLength(1);
    const payload = sent[0].payload as E2ETestResponsePayload;
    expect(payload.action).toBe('report');
    expect(payload.report.summary.failed).toBe(0);
    expect(payload.report.details).toHaveLength(plan.steps.length);
  });
});
