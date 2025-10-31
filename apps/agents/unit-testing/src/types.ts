import type { TestResult } from '@multi-agent/shared-types';

export type PrimitiveGenerator = 'integer' | 'float' | 'string' | 'boolean' | 'json';

export interface ExampleTestCase {
  type: 'example';
  name: string;
  execute: () => Promise<void> | void;
}

export interface PropertyTestCase {
  type: 'property';
  name: string;
  generator: PrimitiveGenerator;
  predicate: (value: unknown) => Promise<boolean> | boolean;
  iterations?: number;
}

export type UnitTestCase = ExampleTestCase | PropertyTestCase;

export interface UnitTestPlan {
  suiteName: string;
  cases: UnitTestCase[];
}

export interface UnitTestCaseResult {
  name: string;
  status: 'passed' | 'failed';
  duration: number;
  error?: string;
}

export interface UnitTestReport {
  summary: TestResult;
  details: UnitTestCaseResult[];
}

export interface UnitTestRequestPayload {
  action: 'run-plan';
  plan: UnitTestPlan;
}

export interface UnitTestResponsePayload {
  action: 'report';
  report: UnitTestReport;
}
