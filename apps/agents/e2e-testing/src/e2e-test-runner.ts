import { performance } from 'node:perf_hooks';
import type { E2ETestPlan, E2ETestCaseResult, E2ETestReport } from './types';

export class E2ETestRunner {
  constructor(private readonly plan: E2ETestPlan) {}

  async run(agentId: string): Promise<E2ETestReport> {
    const results: E2ETestCaseResult[] = [];
    const startedAt = performance.now();

    for (const step of this.plan.steps) {
      const stepStart = performance.now();

      try {
        const outcome = await step.run();
        if (!outcome.success) {
          results.push({
            name: step.name,
            status: 'failed',
            duration: performance.now() - stepStart,
            detail: outcome.detail,
          });
          break;
        }

        results.push({
          name: step.name,
          status: 'passed',
          duration: performance.now() - stepStart,
          detail: outcome.detail,
        });
      } catch (error) {
        results.push({
          name: step.name,
          status: 'failed',
          duration: performance.now() - stepStart,
          detail: error instanceof Error ? error.message : String(error),
        });
        break;
      }
    }

    const duration = performance.now() - startedAt;
    const passed = results.filter((result) => result.status === 'passed').length;
    const failed = results.length - passed;

    return {
      summary: {
        agentId,
        testType: this.plan.scenario,
        passed,
        failed,
        duration,
        timestamp: Date.now(),
      },
      details: results,
    };
  }
}
