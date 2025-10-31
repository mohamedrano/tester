import type { TestResult } from '@multi-agent/shared-types';

export interface ReportEnvelope {
  sourceAgent: string;
  result: TestResult;
  metadata?: Record<string, unknown>;
}

export interface ReportingRequestPayload {
  action: 'aggregate';
  report: ReportEnvelope;
}

export interface ReportingSummaryRequestPayload {
  action: 'summary';
}

export interface ReportingResponsePayload {
  action: 'summary';
  results: TestResult[];
  totals: {
    passed: number;
    failed: number;
  };
}
