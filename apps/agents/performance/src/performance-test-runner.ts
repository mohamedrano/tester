import { performance } from 'node:perf_hooks';
import type { PerformanceTestPlan, PerformanceTestCaseResult, PerformanceTestReport } from './types';

export class PerformanceTestRunner {
  constructor(private readonly plan: PerformanceTestPlan) {}

  async run(agentId: string): Promise<PerformanceTestReport> {
    const results: PerformanceTestCaseResult[] = [];
    const startedAt = performance.now();

    for (const target of this.plan.targets) {
      const iterations = target.iterations ?? 50;
      const targetStart = performance.now();
      let lastError: unknown;

      for (let iteration = 0; iteration < iterations; iteration += 1) {
        try {
          await target.run();
        } catch (error) {
          lastError = error;
          break;
        }
      }

      const duration = performance.now() - targetStart;

      if (lastError) {
        results.push({
          name: target.name,
          status: 'failed',
          duration,
          iterations,
          detail: lastError instanceof Error ? lastError.message : String(lastError),
        });
      } else {
        results.push({
          name: target.name,
          status: duration <= target.budgetMs ? 'passed' : 'failed',
          duration,
          iterations,
          detail: duration <= target.budgetMs ? undefined : `Exceeded budget of ${target.budgetMs}ms`,
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
