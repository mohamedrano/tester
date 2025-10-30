import { performance } from 'node:perf_hooks';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import type { IntegrationTestPlan, IntegrationTestCaseResult, IntegrationTestReport } from './types';

export class IntegrationTestRunner {
  constructor(private readonly plan: IntegrationTestPlan) {}

  async run(agentId: string): Promise<IntegrationTestReport> {
    const server = setupServer(
      ...this.plan.expectations.map((expectation) =>
        http[expectation.method.toLowerCase() as Lowercase<typeof expectation.method>](
          new URL(expectation.path, this.plan.baseUrl).toString(),
          () => {
            return HttpResponse.json(expectation.expectedBody, { status: expectation.expectedStatus });
          },
        ),
      ),
    );

    const results: IntegrationTestCaseResult[] = [];
    const startedAt = performance.now();

    try {
      server.listen({ onUnhandledRequest: 'error' });

      for (const expectation of this.plan.expectations) {
        const caseStart = performance.now();

        try {
          const response = await fetch(new URL(expectation.path, this.plan.baseUrl).toString(), {
            method: expectation.method,
            body: expectation.requestBody ? JSON.stringify(expectation.requestBody) : undefined,
            headers: expectation.requestBody ? { 'content-type': 'application/json' } : undefined,
          });

          if (response.status !== expectation.expectedStatus) {
            throw new Error(`Expected status ${expectation.expectedStatus} but received ${response.status}`);
          }

          const body = await response.json();

          if (JSON.stringify(body) !== JSON.stringify(expectation.expectedBody)) {
            throw new Error(`Response body mismatch. Received ${JSON.stringify(body)}`);
          }

          results.push({
            name: expectation.name,
            status: 'passed',
            duration: performance.now() - caseStart,
          });
        } catch (error) {
          results.push({
            name: expectation.name,
            status: 'failed',
            duration: performance.now() - caseStart,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }
    } finally {
      server.close();
      server.resetHandlers();
    }

    const duration = performance.now() - startedAt;
    const passed = results.filter((c) => c.status === 'passed').length;
    const failed = results.length - passed;

    return {
      summary: {
        agentId,
        testType: this.plan.serviceName,
        passed,
        failed,
        duration,
        timestamp: Date.now(),
      },
      details: results,
    };
  }
}
