import { describe, expect, test } from 'vitest';
import { renderDashboard } from './dashboard';

describe('renderDashboard', () => {
  test('renders a readable table with totals', () => {
    const output = renderDashboard({
      totals: { passed: 3, failed: 1 },
      results: [
        {
          agentId: 'unit-testing-agent',
          testType: 'unit',
          passed: 2,
          failed: 0,
          duration: 12.3,
          timestamp: 1,
        },
        {
          agentId: 'integration-testing-agent',
          testType: 'integration',
          passed: 1,
          failed: 1,
          duration: 32.8,
          timestamp: 2,
        },
      ],
    });

    expect(output).toContain('unit-testing-agent');
    expect(output).toContain('Totals -> Passed: 3');
    expect(output.split('\n')).toHaveLength(3);
  });
});
