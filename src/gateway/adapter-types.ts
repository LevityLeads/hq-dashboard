// Gateway Adapter 数据类型
// 基于 ClawX 类型定义，去除 Electron IPC 依赖

export type ChannelType =
  | "whatsapp"
  | "telegram"
  | "discord"
  | "signal"
  | "feishu"
  | "imessage"
  | "matrix"
  | "line"
  | "msteams"
  | "googlechat"
  | "mattermost";

export type ChannelStatus = "connected" | "disconnected" | "connecting" | "error";

export interface ChannelInfo {
  id: string;
  type: ChannelType;
  name: string;
  status: ChannelStatus;
  accountId?: string;
  error?: string;
}

export interface SkillInfo {
  id: string;
  slug: string;
  name: string;
  description: string;
  enabled: boolean;
  icon: string;
  version: string;
  author?: string;
  isCore?: boolean;
  isBundled?: boolean;
  config?: Record<string, unknown>;
}

export interface CronJobTarget {
  channelType: ChannelType;
  channelId: string;
  channelName: string;
}

export type CronSchedule =
  | { kind: "at"; at: string }
  | { kind: "every"; everyMs: number; anchorMs?: number }
  | { kind: "cron"; expr: string; tz?: string };

export interface CronTask {
  id: string;
  name: string;
  message: string;
  schedule: string | CronSchedule;
  target: CronJobTarget;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
  lastRun?: { time: string; success: boolean; error?: string };
  nextRun?: string;
}

export interface CronTaskInput {
  name: string;
  message: string;
  schedule: string;
  target: CronJobTarget;
  enabled?: boolean;
}

export type MessageRole = "user" | "assistant" | "system";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  runId?: string;
  toolCalls?: ToolCallInfo[];
  thinking?: string;
  isStreaming?: boolean;
}

export interface ToolCallInfo {
  id: string;
  name: string;
  args?: Record<string, unknown>;
  result?: string;
  status: "pending" | "running" | "done" | "error";
}

export interface ChatSendParams {
  text: string;
  sessionKey?: string;
  attachments?: string[];
}

export interface GatewayChatSendParams {
  sessionKey?: string;
  message: string;
  deliver?: boolean;
  idempotencyKey?: string;
}

export interface SessionInfo {
  key: string;
  agentId: string;
  label: string;
  createdAt: number;
  lastActiveAt: number;
  messageCount: number;
}

export interface SessionPreview {
  key: string;
  messages: ChatMessage[];
}

export interface ToolCatalogEntry {
  name: string;
  description: string;
  schema?: Record<string, unknown>;
}

export interface ToolCatalog {
  tools: ToolCatalogEntry[];
}

export interface UsageInfo {
  totalTokens: number;
  totalCost: number;
  periodStart: number;
  periodEnd: number;
  byModel: Record<string, { tokens: number; cost: number }>;
}

// Streaming 事件类型（chat 事件的 payload 格式）
export type ChatStreamEvent =
  | { type: "stream.start"; runId: string; sessionKey?: string }
  | { type: "stream.delta"; runId: string; text: string }
  | { type: "stream.end"; runId: string; aborted?: boolean };
