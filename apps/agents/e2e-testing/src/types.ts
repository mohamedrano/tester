import type { TestResult } from '@multi-agent/shared-types';

export interface E2EStepResult {
  success: boolean;
  detail?: string;
}

export interface E2EStep {
  name: string;
  run: () => Promise<E2EStepResult> | E2EStepResult;
}

export interface E2ETestPlan {
  scenario: string;
  steps: E2EStep[];
}

export interface E2ETestCaseResult {
  name: string;
  status: 'passed' | 'failed';
  duration: number;
  detail?: string;
}

export interface E2ETestReport {
  summary: TestResult;
  details: E2ETestCaseResult[];
}

export interface E2ETestRequestPayload {
  action: 'execute-scenario';
  plan: E2ETestPlan;
}

export interface E2ETestResponsePayload {
  action: 'report';
  report: E2ETestReport;
}
