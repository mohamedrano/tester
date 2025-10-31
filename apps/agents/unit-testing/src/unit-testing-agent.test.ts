import { describe, expect, test, vi } from 'vitest';
import type { AgentContext, AgentMessage } from '@multi-agent/agent-framework';
import { UnitTestingAgent } from './unit-testing-agent';
import { UnitTestRunner } from './unit-test-runner';
import type { UnitTestPlan, UnitTestRequestPayload, UnitTestResponsePayload } from './types';
import { SmartMockFactory } from './smart-mock-factory';

describe('UnitTestingAgent', () => {
  test('runs the provided plan and reports aggregated results', async () => {
    const plan: UnitTestPlan = {
      suiteName: 'math-utils',
      cases: [
        {
          type: 'example',
          name: 'doubles numbers',
          execute: () => {
            expect(2 * 2).toBe(4);
          },
        },
        {
          type: 'property',
          name: 'doubling preserves evenness',
          generator: 'integer',
          predicate: (value) => {
            if (typeof value !== 'number') {
              return false;
            }

            const result = value * 2;
            return result % 2 === 0;
          },
        },
      ],
    };

    const runner = new UnitTestRunner(plan);
    const createRunner = vi.fn().mockReturnValue(runner);
    const agent = new UnitTestingAgent({}, { createRunner });
    const sentMessages: AgentMessage[] = [];
    const context: AgentContext = {
      sendMessage: async (message) => {
        sentMessages.push(message);
      },
    };

    const request: AgentMessage = {
      id: 'req-1',
      from: 'orchestrator',
      to: agent.id,
      type: 'request',
      payload: { action: 'run-plan', plan } satisfies UnitTestRequestPayload,
      priority: 'medium',
      timestamp: Date.now(),
    };

    await agent.handleMessage(request, context);

    expect(createRunner).toHaveBeenCalledWith(plan);
    expect(sentMessages).toHaveLength(1);
    const responsePayload = sentMessages[0].payload as UnitTestResponsePayload;
    expect(responsePayload.action).toBe('report');
    expect(responsePayload.report.summary.passed).toBeGreaterThanOrEqual(1);
    expect(responsePayload.report.summary.failed).toBeGreaterThanOrEqual(0);
    expect(responsePayload.report.details).toHaveLength(plan.cases.length);
  });
});

describe('SmartMockFactory', () => {
  interface Dependency {
    label: string;
    compute: (value: number) => number;
  }

  test('creates mocks pre-populated with default behaviours', () => {
    const factory = new SmartMockFactory();
    const mock = factory.create<Dependency>({
      label: 'calculator',
      compute: (value) => value * 3,
    });

    expect(mock.label).toBe('calculator');
    expect(mock.compute(2)).toBe(6);
  });
});
