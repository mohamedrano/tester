import { describe, expect, test } from 'vitest';
import { TestingOrchestrator } from './orchestrator';
import { UnitTestingAgent } from '@multi-agent/unit-testing-agent';
import { IntegrationTestingAgent } from '@multi-agent/integration-testing-agent';
import { ReportingAgent } from '@multi-agent/reporting-agent';
import type {
  UnitTestPlan,
  UnitTestRequestPayload,
  UnitTestResponsePayload,
} from '@multi-agent/unit-testing-agent';
import type {
  IntegrationTestPlan,
  IntegrationTestRequestPayload,
  IntegrationTestResponsePayload,
} from '@multi-agent/integration-testing-agent';
import type { ReportingResponsePayload } from '@multi-agent/reporting-agent';

describe('TestingOrchestrator', () => {
  test('coordinates registered agents and aggregates reports', async () => {
    const orchestrator = new TestingOrchestrator();
    orchestrator.registerReportingAgent(() => new ReportingAgent());
    orchestrator.registerAgent('unit', () => new UnitTestingAgent());
    orchestrator.registerAgent('integration', () => new IntegrationTestingAgent());

    const unitPlan: UnitTestPlan = {
      suiteName: 'math-suite',
      cases: [
        {
          type: 'example',
          name: 'basic arithmetic',
          execute: () => {
            expect(1 + 1).toBe(2);
          },
        },
        {
          type: 'property',
          name: 'doubling keeps numbers even',
          generator: 'integer',
          predicate: (value) => {
            if (typeof value !== 'number') {
              return false;
            }

            return (value * 2) % 2 === 0;
          },
        },
      ],
    };

    const unitResponse = await orchestrator.execute('unit', {
      action: 'run-plan',
      plan: unitPlan,
    } satisfies UnitTestRequestPayload);

    const unitPayload = unitResponse.payload as UnitTestResponsePayload;
    expect(unitPayload.report.summary.failed).toBe(0);

    const integrationPlan: IntegrationTestPlan = {
      serviceName: 'catalog-service',
      baseUrl: 'http://localhost',
      expectations: [
        {
          name: 'list items',
          method: 'GET',
          path: '/items',
          expectedStatus: 200,
          expectedBody: [{ id: 'item-1' }],
        },
      ],
    };

    const integrationResponse = await orchestrator.execute('integration', {
      action: 'validate-contract',
      plan: integrationPlan,
    } satisfies IntegrationTestRequestPayload);

    const integrationPayload = integrationResponse.payload as IntegrationTestResponsePayload;
    expect(integrationPayload.report.summary.failed).toBe(0);

    const summaryMessage = await orchestrator.fetchSummary();
    const summaryPayload = summaryMessage.payload as ReportingResponsePayload;
    expect(summaryPayload.results.length).toBeGreaterThanOrEqual(2);
    expect(summaryPayload.totals.passed).toBeGreaterThanOrEqual(3);
  });
});
