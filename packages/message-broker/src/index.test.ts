import { describe, expect, it } from 'vitest';
import type { AgentMessage } from '@multi-agent/shared-types';
import { InMemoryMessageBroker, createEnvelope } from './index';

const baseMessage: AgentMessage = {
  id: 'msg-1',
  from: 'orchestrator',
  to: 'unit-agent',
  type: 'request',
  payload: { suite: 'unit' },
  priority: 'medium',
  timestamp: Date.now(),
};

describe('InMemoryMessageBroker', () => {
  it('publishes messages to subscribers', async () => {
    const broker = new InMemoryMessageBroker();
    const received: string[] = [];

    broker.subscribe('unit', async (envelope) => {
      received.push((envelope.payload as { suite: string }).suite);
    });

    broker.publish('unit', createEnvelope(baseMessage, { suite: 'unit' }));

    expect(received).toEqual(['unit']);
  });

  it('supports request/response interactions', async () => {
    const broker = new InMemoryMessageBroker();

    broker.subscribe('responses', async (envelope) => {
      // no-op; tests ensure request triggers response listener
    });

    setTimeout(() => {
      broker.publish(
        'responses',
        createEnvelope(
          { ...baseMessage, id: 'msg-2', type: 'response' },
          { status: 'ok' },
        ),
      );
    }, 10);

    const response = await broker.requestResponse('requests', 'responses', createEnvelope(baseMessage, { suite: 'unit' }), 1000);

    expect(response.message.type).toBe('response');
    expect(response.payload).toEqual({ status: 'ok' });
  });

  it('reports health metrics', () => {
    const broker = new InMemoryMessageBroker();
    const subscription = broker.subscribe('unit', () => undefined);

    const health = broker.health();

    expect(health.status).toBe('ok');
    expect(health.channels).toBe(1);
    expect(health.subscribers).toBe(1);

    subscription.unsubscribe();
  });
});
