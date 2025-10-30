import { describe, expect, test } from 'vitest';
import type { AgentContext, AgentMessage } from '@multi-agent/agent-framework';
import { ReportingAgent } from './reporting-agent';
import { ReportingStore } from './reporting-store';
import type { ReportingResponsePayload } from './types';

describe('ReportingAgent', () => {
  test('aggregates reports and returns consolidated summary', async () => {
    const store = new ReportingStore();
    const agent = new ReportingAgent({}, { store });
    const responses: AgentMessage[] = [];
    const context: AgentContext = {
      sendMessage: async (message) => responses.push(message),
    };

    const notification: AgentMessage = {
      id: 'unit-report',
      from: 'unit-testing-agent',
      to: agent.id,
      type: 'notification',
      payload: {
        action: 'aggregate',
        report: {
          sourceAgent: 'unit-testing-agent',
          result: {
            agentId: 'unit-testing-agent',
            testType: 'unit',
            passed: 5,
            failed: 0,
            duration: 12,
            timestamp: Date.now(),
          },
        },
      },
      priority: 'medium',
      timestamp: Date.now(),
    };

    await agent.handleMessage(notification, context);

    const summaryRequest: AgentMessage = {
      id: 'summary-request',
      from: 'dashboard',
      to: agent.id,
      type: 'request',
      payload: { action: 'summary' },
      priority: 'low',
      timestamp: Date.now(),
    };

    await agent.handleMessage(summaryRequest, context);

    expect(responses).toHaveLength(1);
    const payload = responses[0].payload as ReportingResponsePayload;
    expect(payload.action).toBe('summary');
    expect(payload.results).toHaveLength(1);
    expect(payload.totals.passed).toBe(5);
    expect(payload.totals.failed).toBe(0);
  });
});
