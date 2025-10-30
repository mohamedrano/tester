import { performance } from 'node:perf_hooks';
import type { SecurityTestPlan, SecurityTestCaseResult, SecurityTestReport } from './types';

export class SecurityTestRunner {
  constructor(private readonly plan: SecurityTestPlan) {}

  async run(agentId: string): Promise<SecurityTestReport> {
    const results: SecurityTestCaseResult[] = [];
    const startedAt = performance.now();

    for (const check of this.plan.checks) {
      const checkStarted = performance.now();

      try {
        const result = await check.execute(this.plan.context);

        results.push({
          name: check.name,
          status: result.passed ? 'passed' : 'failed',
          duration: performance.now() - checkStarted,
          detail: result.detail,
        });
      } catch (error) {
        results.push({
          name: check.name,
          status: 'failed',
          duration: performance.now() - checkStarted,
          detail: error instanceof Error ? error.message : String(error),
        });
      }
    }

    const duration = performance.now() - startedAt;
    const passed = results.filter((result) => result.status === 'passed').length;
    const failed = results.length - passed;

    return {
      summary: {
        agentId,
        testType: this.plan.suite,
        passed,
        failed,
        duration,
        timestamp: Date.now(),
      },
      details: results,
    };
  }
}
