import { describe, expect, test, vi } from 'vitest';
import type { AgentContext, AgentMessage } from '@multi-agent/agent-framework';
import { MaintenanceTestingAgent } from './maintenance-testing-agent';
import { MaintenanceTestRunner } from './maintenance-test-runner';
import type {
  MaintenanceTestPlan,
  MaintenanceTestRequestPayload,
  MaintenanceTestResponsePayload,
} from './types';

describe('MaintenanceTestingAgent', () => {
  test('evaluates maintainability checks', async () => {
    const plan: MaintenanceTestPlan = {
      repository: 'monorepo',
      artifacts: [
        { path: 'src/index.ts', content: 'const value = 42;\n' },
        { path: 'README.md', content: '# Project\n' },
      ],
      checks: [
        {
          name: 'no todo comments',
          evaluate: (artifacts) => ({
            passed: artifacts.every((artifact) => !/TODO/i.test(artifact.content)),
            detail: 'Ensures there are no leftover TODO comments',
          }),
        },
      ],
    };

    const runner = new MaintenanceTestRunner(plan);
    const createRunner = vi.fn().mockReturnValue(runner);
    const agent = new MaintenanceTestingAgent({}, { createRunner });
    const sent: AgentMessage[] = [];
    const context: AgentContext = {
      sendMessage: async (message) => sent.push(message),
    };

    const message: AgentMessage = {
      id: 'maintenance-request',
      from: 'orchestrator',
      to: agent.id,
      type: 'request',
      payload: { action: 'evaluate-maintainability', plan } satisfies MaintenanceTestRequestPayload,
      priority: 'low',
      timestamp: Date.now(),
    };

    await agent.handleMessage(message, context);

    expect(createRunner).toHaveBeenCalledWith(plan);
    expect(sent).toHaveLength(1);
    const payload = sent[0].payload as MaintenanceTestResponsePayload;
    expect(payload.action).toBe('report');
    expect(payload.report.summary.failed).toBe(0);
  });
});
