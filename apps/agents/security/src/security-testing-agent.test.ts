import { describe, expect, test, vi } from 'vitest';
import type { AgentContext, AgentMessage } from '@multi-agent/agent-framework';
import { SecurityTestingAgent } from './security-testing-agent';
import { SecurityTestRunner } from './security-test-runner';
import type { SecurityTestPlan, SecurityTestRequestPayload, SecurityTestResponsePayload } from './types';

describe('SecurityTestingAgent', () => {
  test('executes security checks and reports results', async () => {
    const plan: SecurityTestPlan = {
      suite: 'api-security',
      context: { payload: { token: 'abc' } },
      checks: [
        {
          name: 'token must be non empty',
          execute: (ctx) => ({ passed: Boolean((ctx.payload as { token?: string }).token) }),
        },
      ],
    };

    const runner = new SecurityTestRunner(plan);
    const createRunner = vi.fn().mockReturnValue(runner);
    const agent = new SecurityTestingAgent({}, { createRunner });
    const sent: AgentMessage[] = [];
    const context: AgentContext = {
      sendMessage: async (message) => sent.push(message),
    };

    const request: AgentMessage = {
      id: 'security-request',
      from: 'orchestrator',
      to: agent.id,
      type: 'request',
      payload: { action: 'run-security-checks', plan } satisfies SecurityTestRequestPayload,
      priority: 'high',
      timestamp: Date.now(),
    };

    await agent.handleMessage(request, context);

    expect(createRunner).toHaveBeenCalledWith(plan);
    expect(sent).toHaveLength(1);
    const payload = sent[0].payload as SecurityTestResponsePayload;
    expect(payload.action).toBe('report');
    expect(payload.report.summary.failed).toBe(0);
  });
});
