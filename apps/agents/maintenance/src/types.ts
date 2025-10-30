import type { TestResult } from '@multi-agent/shared-types';

export interface MaintenanceArtifact {
  path: string;
  content: string;
}

export interface MaintenanceCheckResult {
  passed: boolean;
  detail?: string;
}

export interface MaintenanceCheck {
  name: string;
  evaluate: (artifact: MaintenanceArtifact[]) => Promise<MaintenanceCheckResult> | MaintenanceCheckResult;
}

export interface MaintenanceTestPlan {
  repository: string;
  artifacts: MaintenanceArtifact[];
  checks: MaintenanceCheck[];
}

export interface MaintenanceTestCaseResult {
  name: string;
  status: 'passed' | 'failed';
  duration: number;
  detail?: string;
}

export interface MaintenanceTestReport {
  summary: TestResult;
  details: MaintenanceTestCaseResult[];
}

export interface MaintenanceTestRequestPayload {
  action: 'evaluate-maintainability';
  plan: MaintenanceTestPlan;
}

export interface MaintenanceTestResponsePayload {
  action: 'report';
  report: MaintenanceTestReport;
}
