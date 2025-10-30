import { performance } from 'node:perf_hooks';
import type { MaintenanceTestPlan, MaintenanceTestCaseResult, MaintenanceTestReport } from './types';

export class MaintenanceTestRunner {
  constructor(private readonly plan: MaintenanceTestPlan) {}

  async run(agentId: string): Promise<MaintenanceTestReport> {
    const results: MaintenanceTestCaseResult[] = [];
    const startedAt = performance.now();

    for (const check of this.plan.checks) {
      const checkStart = performance.now();

      try {
        const result = await check.evaluate(this.plan.artifacts);
        results.push({
          name: check.name,
          status: result.passed ? 'passed' : 'failed',
          duration: performance.now() - checkStart,
          detail: result.detail,
        });
      } catch (error) {
        results.push({
          name: check.name,
          status: 'failed',
          duration: performance.now() - checkStart,
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
        testType: this.plan.repository,
        passed,
        failed,
        duration,
        timestamp: Date.now(),
      },
      details: results,
    };
  }
}
