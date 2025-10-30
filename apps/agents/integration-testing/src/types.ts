import type { TestResult } from '@multi-agent/shared-types';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ServiceContractExpectation {
  name: string;
  method: HttpMethod;
  path: string;
  expectedStatus: number;
  expectedBody: unknown;
  requestBody?: unknown;
}

export interface IntegrationTestPlan {
  serviceName: string;
  baseUrl: string;
  expectations: ServiceContractExpectation[];
}

export interface IntegrationTestCaseResult {
  name: string;
  status: 'passed' | 'failed';
  duration: number;
  error?: string;
}

export interface IntegrationTestReport {
  summary: TestResult;
  details: IntegrationTestCaseResult[];
}

export interface IntegrationTestRequestPayload {
  action: 'validate-contract';
  plan: IntegrationTestPlan;
}

export interface IntegrationTestResponsePayload {
  action: 'report';
  report: IntegrationTestReport;
}
