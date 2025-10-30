import type { TestResult } from '@multi-agent/shared-types';

export interface DashboardSummary {
  totals: {
    passed: number;
    failed: number;
  };
  results: TestResult[];
}

export function renderDashboard(summary: DashboardSummary): string {
  const header = ['Agent', 'Test Type', 'Passed', 'Failed', 'Duration (ms)'];
  const rows = summary.results.map((result) => [
    result.agentId,
    result.testType,
    result.passed.toString(),
    result.failed.toString(),
    result.duration.toFixed(2),
  ]);

  const table = [header, ...rows]
    .map((row) => row.map((cell) => cell.padEnd(15, ' ')).join('|'))
    .join('\n');

  const totalsLine = `Totals -> Passed: ${summary.totals.passed} | Failed: ${summary.totals.failed}`;

  return `${table}\n${totalsLine}`;
}
