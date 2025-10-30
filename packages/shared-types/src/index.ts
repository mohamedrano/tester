export type AgentMessageType = 'request' | 'response' | 'notification';
export type AgentMessagePriority = 'low' | 'medium' | 'high' | 'critical';

export interface AgentMessage {
  id: string;
  from: string;
  to: string;
  type: AgentMessageType;
  payload: unknown;
  priority: AgentMessagePriority;
  timestamp: number;
}

export interface TestResult {
  agentId: string;
  testType: string;
  passed: number;
  failed: number;
  duration: number;
  timestamp: number;
}

export interface BrokerEnvelope<TPayload> {
  message: AgentMessage;
  payload: TPayload;
}
