import { performance } from 'node:perf_hooks';
import fc from 'fast-check';
import type { PrimitiveGenerator, UnitTestCase, UnitTestCaseResult, UnitTestPlan, UnitTestReport } from './types';

const generatorMap: Record<PrimitiveGenerator, fc.Arbitrary<unknown>> = {
  integer: fc.integer(),
  float: fc.float({ noNaN: true }),
  string: fc.string(),
  boolean: fc.boolean(),
  json: fc.jsonValue(),
};

export interface UnitTestRunnerOptions {
  iterations?: number;
}

export class UnitTestRunner {
  constructor(private readonly plan: UnitTestPlan, private readonly options: UnitTestRunnerOptions = {}) {}

  async run(agentId: string): Promise<UnitTestReport> {
    const caseResults: UnitTestCaseResult[] = [];
    const startedAt = performance.now();

    for (const testCase of this.plan.cases) {
      const result = await this.executeCase(testCase);
      caseResults.push(result);
    }

    const duration = performance.now() - startedAt;
    const passed = caseResults.filter((c) => c.status === 'passed').length;
    const failed = caseResults.length - passed;

    return {
      summary: {
        agentId,
        testType: this.plan.suiteName,
        passed,
        failed,
        duration,
        timestamp: Date.now(),
      },
      details: caseResults,
    };
  }

  private async executeCase(testCase: UnitTestCase): Promise<UnitTestCaseResult> {
    const startedAt = performance.now();

    try {
      if (testCase.type === 'example') {
        await testCase.execute();
      } else {
        const arbitrary = generatorMap[testCase.generator];
        const iterations = testCase.iterations ?? this.options.iterations ?? 50;

        await fc.assert(
          fc.asyncProperty(arbitrary, async (value) => {
            const outcome = await testCase.predicate(value);
            return outcome === true;
          }),
          { numRuns: iterations },
        );
      }

      return {
        name: testCase.name,
        status: 'passed',
        duration: performance.now() - startedAt,
      };
    } catch (error) {
      return {
        name: testCase.name,
        status: 'failed',
        duration: performance.now() - startedAt,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
