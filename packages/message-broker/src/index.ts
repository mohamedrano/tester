import type { AgentMessage, BrokerEnvelope } from '@multi-agent/shared-types';

type MessageHandler<TPayload> = (envelope: BrokerEnvelope<TPayload>) => Promise<void> | void;

export interface Subscription {
  unsubscribe: () => void;
}

export interface MessageBroker {
  publish<TPayload>(channel: string, envelope: BrokerEnvelope<TPayload>): Promise<void> | void;
  subscribe<TPayload>(channel: string, handler: MessageHandler<TPayload>): Subscription;
  clear(channel?: string): void;
  health(): BrokerHealth;
}

export interface BrokerHealth {
  status: 'ok';
  channels: number;
  subscribers: number;
}

class InMemorySubscription implements Subscription {
  constructor(private readonly disposer: () => void) {}

  unsubscribe(): void {
    this.disposer();
  }
}

export class InMemoryMessageBroker implements MessageBroker {
  private readonly handlers = new Map<string, Set<MessageHandler<unknown>>>();

  publish<TPayload>(channel: string, envelope: BrokerEnvelope<TPayload>): void {
    const channelHandlers = this.handlers.get(channel);

    if (!channelHandlers || channelHandlers.size === 0) {
      return;
    }

    for (const handler of channelHandlers) {
      void handler(envelope as BrokerEnvelope<unknown>);
    }
  }

  subscribe<TPayload>(channel: string, handler: MessageHandler<TPayload>): Subscription {
    const channelHandlers = this.handlers.get(channel) ?? new Set<MessageHandler<TPayload>>();
    channelHandlers.add(handler);
    this.handlers.set(channel, channelHandlers as Set<MessageHandler<unknown>>);

    return new InMemorySubscription(() => {
      channelHandlers.delete(handler);
      if (channelHandlers.size === 0) {
        this.handlers.delete(channel);
      }
    });
  }

  clear(channel?: string): void {
    if (channel) {
      this.handlers.delete(channel);
      return;
    }

    this.handlers.clear();
  }

  health(): BrokerHealth {
    let subscribers = 0;
    for (const handlerSet of this.handlers.values()) {
      subscribers += handlerSet.size;
    }

    return {
      status: 'ok',
      channels: this.handlers.size,
      subscribers,
    };
  }

  async requestResponse<TRequestPayload, TResponsePayload>(
    requestChannel: string,
    responseChannel: string,
    request: BrokerEnvelope<TRequestPayload>,
    timeoutMs = 5_000,
  ): Promise<BrokerEnvelope<TResponsePayload>> {
    return new Promise<BrokerEnvelope<TResponsePayload>>((resolve, reject) => {
      let settled = false;
      let timer: ReturnType<typeof setTimeout>;

      const subscription = this.subscribe<TResponsePayload>(responseChannel, (envelope) => {
        if (settled) {
          return;
        }

        settled = true;
        clearTimeout(timer);
        subscription.unsubscribe();
        resolve(envelope);
      });

      timer = setTimeout(() => {
        if (settled) {
          return;
        }

        settled = true;
        subscription.unsubscribe();
        reject(new Error(`Timed out waiting for response on ${responseChannel}`));
      }, timeoutMs);

      this.publish(requestChannel, request);
    });
  }
}

export function createEnvelope<TPayload>(
  message: AgentMessage,
  payload: TPayload,
): BrokerEnvelope<TPayload> {
  return { message, payload };
}
