import type { TestResult } from '@multi-agent/shared-types';

export class ReportingStore {
  private readonly results: TestResult[] = [];

  add(result: TestResult): void {
    this.results.push(result);
  }

  all(): TestResult[] {
    return [...this.results].sort((left, right) => right.timestamp - left.timestamp);
  }

  totals(): { passed: number; failed: number } {
    return this.results.reduce(
      (accumulator, result) => ({
        passed: accumulator.passed + result.passed,
        failed: accumulator.failed + result.failed,
      }),
      { passed: 0, failed: 0 },
    );
  }
}
