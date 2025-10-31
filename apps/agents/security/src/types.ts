import type { TestResult } from '@multi-agent/shared-types';

export interface SecurityCheckContext {
  payload: unknown;
}

export interface SecurityCheckResult {
  passed: boolean;
  detail?: string;
}

export interface SecurityCheck {
  name: string;
  execute: (context: SecurityCheckContext) => Promise<SecurityCheckResult> | SecurityCheckResult;
}

export interface SecurityTestPlan {
  suite: string;
  context: SecurityCheckContext;
  checks: SecurityCheck[];
}

export interface SecurityTestCaseResult {
  name: string;
  status: 'passed' | 'failed';
  duration: number;
  detail?: string;
}

export interface SecurityTestReport {
  summary: TestResult;
  details: SecurityTestCaseResult[];
}

export interface SecurityTestRequestPayload {
  action: 'run-security-checks';
  plan: SecurityTestPlan;
}

export interface SecurityTestResponsePayload {
  action: 'report';
  report: SecurityTestReport;
}
