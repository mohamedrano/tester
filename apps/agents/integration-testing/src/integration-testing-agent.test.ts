import { describe, expect, test, vi } from 'vitest';
import type { AgentContext, AgentMessage } from '@multi-agent/agent-framework';
import { IntegrationTestingAgent } from './integration-testing-agent';
import { IntegrationTestRunner } from './integration-test-runner';
import type {
  IntegrationTestPlan,
  IntegrationTestRequestPayload,
  IntegrationTestResponsePayload,
} from './types';

describe('IntegrationTestingAgent', () => {
  test('validates API contract and reports the outcome', async () => {
    const plan: IntegrationTestPlan = {
      serviceName: 'catalog-service',
      baseUrl: 'http://localhost',
      expectations: [
        {
          name: 'list products',
          method: 'GET',
          path: '/products',
          expectedStatus: 200,
          expectedBody: [{ id: 'p-1', name: 'Laptop' }],
        },
      ],
    };

    const runner = new IntegrationTestRunner(plan);
    const createRunner = vi.fn().mockReturnValue(runner);
    const agent = new IntegrationTestingAgent({}, { createRunner });
    const sent: AgentMessage[] = [];
    const context: AgentContext = {
      sendMessage: async (message) => {
        sent.push(message);
      },
    };

    const message: AgentMessage = {
      id: 'integration-request',
      from: 'orchestrator',
      to: agent.id,
      type: 'request',
      payload: { action: 'validate-contract', plan } satisfies IntegrationTestRequestPayload,
      priority: 'high',
      timestamp: Date.now(),
    };

    await agent.handleMessage(message, context);

    expect(createRunner).toHaveBeenCalledWith(plan);
    expect(sent).toHaveLength(1);
    const payload = sent[0].payload as IntegrationTestResponsePayload;
    expect(payload.action).toBe('report');
    expect(payload.report.summary.failed).toBe(0);
    expect(payload.report.summary.passed).toBe(plan.expectations.length);
  });
});
