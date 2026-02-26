// Gateway Adapter 统一接口
// 提供 mock 与 gateway（WebSocket）两种实现

import type {
  ChannelInfo,
  ChatMessage,
  ChatSendParams,
  CronTask,
  CronTaskInput,
  SessionInfo,
  SessionPreview,
  SkillInfo,
  ToolCatalog,
  UsageInfo,
} from "./adapter-types";
import type { AgentsListResponse } from "./types";

export type AdapterEventHandler = (event: string, payload: unknown) => void;

export interface GatewayAdapter {
  connect(): Promise<void>;
  disconnect(): void;
  onEvent(handler: AdapterEventHandler): () => void;

  // Chat
  chatHistory(sessionKey?: string): Promise<ChatMessage[]>;
  chatSend(params: ChatSendParams): Promise<void>;
  chatAbort(sessionKeyOrRunId: string): Promise<void>;

  // Sessions
  sessionsList(): Promise<SessionInfo[]>;
  sessionsPreview(sessionKey: string): Promise<SessionPreview>;

  // Channels
  channelsStatus(): Promise<ChannelInfo[]>;

  // Skills
  skillsStatus(): Promise<SkillInfo[]>;

  // Cron
  cronList(): Promise<CronTask[]>;
  cronAdd(input: CronTaskInput): Promise<CronTask>;
  cronUpdate(id: string, patch: Partial<CronTaskInput>): Promise<CronTask>;
  cronRemove(id: string): Promise<void>;
  cronRun(id: string): Promise<void>;

  // Agents & Tools
  agentsList(): Promise<AgentsListResponse>;
  toolsCatalog(): Promise<ToolCatalog>;
  usageStatus(): Promise<UsageInfo>;
}
