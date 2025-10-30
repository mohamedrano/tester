import type { TestResult } from '@multi-agent/shared-types';

export interface PerformanceTarget {
  name: string;
  run: () => Promise<void> | void;
  iterations?: number;
  budgetMs: number;
}

export interface PerformanceTestPlan {
  suite: string;
  targets: PerformanceTarget[];
}

export interface PerformanceTestCaseResult {
  name: string;
  status: 'passed' | 'failed';
  duration: number;
  iterations: number;
  detail?: string;
}

export interface PerformanceTestReport {
  summary: TestResult;
  details: PerformanceTestCaseResult[];
}

export interface PerformanceTestRequestPayload {
  action: 'measure-performance';
  plan: PerformanceTestPlan;
}

export interface PerformanceTestResponsePayload {
  action: 'report';
  report: PerformanceTestReport;
}
