import type { GatewayAdapter, AdapterEventHandler } from "./adapter";
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

const MOCK_CHANNELS: ChannelInfo[] = [
  { id: "telegram-bot1", type: "telegram", name: "MyBot", status: "connected" },
  { id: "discord-srv1", type: "discord", name: "Dev Server", status: "connected" },
  { id: "whatsapp-wa1", type: "whatsapp", name: "WhatsApp", status: "disconnected" },
];

const MOCK_SKILLS: SkillInfo[] = [
  { id: "web-search", slug: "web-search", name: "Web Search", description: "搜索互联网获取实时信息", enabled: true, icon: "🔍", version: "1.0.0", isCore: true, isBundled: true },
  { id: "code-interpreter", slug: "code-interpreter", name: "Code Interpreter", description: "执行代码并返回结果", enabled: true, icon: "💻", version: "1.2.0", isCore: true, isBundled: true },
  { id: "image-gen", slug: "image-gen", name: "Image Generation", description: "生成图片", enabled: false, icon: "🎨", version: "0.9.0" },
];

const MOCK_CRON_TASKS: CronTask[] = [
  {
    id: "cron-1",
    name: "每日摘要",
    message: "生成今日工作摘要",
    schedule: "0 18 * * *",
    target: { channelType: "telegram", channelId: "bot1", channelName: "MyBot" },
    enabled: true,
    createdAt: new Date(Date.now() - 7 * 86400_000).toISOString(),
    updatedAt: new Date().toISOString(),
    lastRun: { time: new Date(Date.now() - 86400_000).toISOString(), success: true },
    nextRun: new Date(Date.now() + 3600_000).toISOString(),
  },
];

export class MockAdapter implements GatewayAdapter {
  private handlers: Set<AdapterEventHandler> = new Set();
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private pendingTimers: ReturnType<typeof setTimeout>[] = [];

  async connect(): Promise<void> {
    this.heartbeatTimer = setInterval(() => {
      for (const h of this.handlers) {
        h("heartbeat", { ts: Date.now() });
      }
    }, 30_000);
  }

  disconnect(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    this.cancelPendingTimers();
    this.handlers.clear();
  }

  onEvent(handler: AdapterEventHandler): () => void {
    this.handlers.add(handler);
    return () => { this.handlers.delete(handler); };
  }

  private emit(event: string, payload: unknown): void {
    for (const h of this.handlers) {
      h(event, payload);
    }
  }

  private cancelPendingTimers(): void {
    for (const t of this.pendingTimers) {
      clearTimeout(t);
    }
    this.pendingTimers = [];
  }

  private scheduleTimer(fn: () => void, ms: number): void {
    const t = setTimeout(fn, ms);
    this.pendingTimers.push(t);
  }

  async chatHistory(): Promise<ChatMessage[]> {
    return [
      {
        id: "msg-hist-1",
        role: "user",
        content: "你好，请介绍一下 OpenClaw",
        timestamp: Date.now() - 120_000,
      },
      {
        id: "msg-hist-2",
        role: "assistant",
        content: "**OpenClaw** 是一个多 Agent 协作系统，支持：\n\n- 多渠道消息接入（Telegram、Discord、WhatsApp 等）\n- 工具调用和技能扩展\n- 定时任务调度\n- 实时可视化监控\n\n你可以通过 OpenClaw Office 观察 Agent 的协作行为。",
        timestamp: Date.now() - 110_000,
      },
    ];
  }

  async chatSend(params: ChatSendParams): Promise<void> {
    const runId = `mock-run-${Date.now()}`;
    const responseText = `收到你的消息：「${params.text}」\n\n这是 Mock 模式下的模拟回复。在连接真实 Gateway 后，这里将显示 Agent 的实际响应。`;

    // Simulate Gateway chat events: delta → delta → final
    this.scheduleTimer(() => {
      this.emit("chat", {
        type: "event",
        event: "chat",
        payload: {
          runId,
          state: "delta",
          message: {
            role: "assistant",
            content: responseText.slice(0, Math.floor(responseText.length / 2)),
          },
        },
      });
    }, 300);

    this.scheduleTimer(() => {
      this.emit("chat", {
        type: "event",
        event: "chat",
        payload: {
          runId,
          state: "delta",
          message: {
            role: "assistant",
            content: responseText,
          },
        },
      });
    }, 800);

    this.scheduleTimer(() => {
      this.emit("chat", {
        type: "event",
        event: "chat",
        payload: {
          runId,
          state: "final",
          message: {
            role: "assistant",
            content: responseText,
            id: `mock-msg-${Date.now()}`,
            stopReason: "end_turn",
          },
        },
      });
    }, 1200);
  }

  async chatAbort(_runId: string): Promise<void> {
    this.cancelPendingTimers();
    this.emit("chat", {
      type: "event",
      event: "chat",
      payload: { state: "aborted" },
    });
  }

  async sessionsList(): Promise<SessionInfo[]> {
    return [
      { key: "agent:main:main", agentId: "agent-main", label: "默认会话", createdAt: Date.now() - 3600_000, lastActiveAt: Date.now(), messageCount: 12 },
    ];
  }

  async sessionsPreview(sessionKey: string): Promise<SessionPreview> {
    return { key: sessionKey, messages: await this.chatHistory() };
  }

  async channelsStatus(): Promise<ChannelInfo[]> {
    return [...MOCK_CHANNELS];
  }

  async skillsStatus(): Promise<SkillInfo[]> {
    return [...MOCK_SKILLS];
  }

  async cronList(): Promise<CronTask[]> {
    return [...MOCK_CRON_TASKS];
  }

  async cronAdd(input: CronTaskInput): Promise<CronTask> {
    return {
      id: `cron-${Date.now()}`,
      ...input,
      enabled: input.enabled ?? true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async cronUpdate(id: string, patch: Partial<CronTaskInput>): Promise<CronTask> {
    const existing = MOCK_CRON_TASKS.find((t) => t.id === id);
    if (!existing) throw new Error(`Cron task not found: ${id}`);
    return { ...existing, ...patch, updatedAt: new Date().toISOString() };
  }

  async cronRemove(_id: string): Promise<void> {}

  async cronRun(_id: string): Promise<void> {}

  async agentsList(): Promise<AgentsListResponse> {
    return {
      defaultId: "agent-main",
      mainKey: "main",
      scope: "global",
      agents: [
        { id: "agent-main", name: "Main Agent" },
        { id: "agent-research", name: "Research Agent" },
      ],
    };
  }

  async toolsCatalog(): Promise<ToolCatalog> {
    return {
      tools: [
        { name: "web_search", description: "搜索互联网" },
        { name: "code_exec", description: "执行代码" },
      ],
    };
  }

  async usageStatus(): Promise<UsageInfo> {
    return {
      totalTokens: 125_000,
      totalCost: 2.5,
      periodStart: Date.now() - 30 * 86400_000,
      periodEnd: Date.now(),
      byModel: {
        "claude-4": { tokens: 100_000, cost: 2.0 },
        "claude-4-haiku": { tokens: 25_000, cost: 0.5 },
      },
    };
  }
}
