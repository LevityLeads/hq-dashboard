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
import type { GatewayRpcClient } from "./rpc-client";
import type { GatewayWsClient } from "./ws-client";

export class WsAdapter implements GatewayAdapter {
  private handlers: Set<AdapterEventHandler> = new Set();
  private unsubscribers: Array<() => void> = [];

  constructor(
    private wsClient: GatewayWsClient,
    private rpcClient: GatewayRpcClient,
  ) {}

  private static readonly WATCHED_EVENTS = ["agent", "chat", "presence", "health", "heartbeat", "cron", "shutdown"] as const;

  async connect(): Promise<void> {
    for (const eventName of WsAdapter.WATCHED_EVENTS) {
      const unsub = this.wsClient.onEvent(eventName, (payload: unknown) => {
        for (const h of this.handlers) {
          h(eventName, payload);
        }
      });
      this.unsubscribers.push(unsub);
    }
  }

  disconnect(): void {
    for (const unsub of this.unsubscribers) {
      unsub();
    }
    this.unsubscribers = [];
    this.handlers.clear();
  }

  onEvent(handler: AdapterEventHandler): () => void {
    this.handlers.add(handler);
    return () => { this.handlers.delete(handler); };
  }

  async chatHistory(sessionKey?: string): Promise<ChatMessage[]> {
    return this.rpcClient.request<ChatMessage[]>("chat.history", sessionKey ? { sessionKey } : {});
  }

  async chatSend(params: ChatSendParams): Promise<void> {
    await this.rpcClient.request("chat.send", {
      sessionKey: params.sessionKey,
      message: params.text,
      deliver: false,
      idempotencyKey: crypto.randomUUID(),
    });
  }

  async chatAbort(sessionKeyOrRunId: string): Promise<void> {
    await this.rpcClient.request("chat.abort", { sessionKey: sessionKeyOrRunId });
  }

  async sessionsList(): Promise<SessionInfo[]> {
    return this.rpcClient.request<SessionInfo[]>("sessions.list");
  }

  async sessionsPreview(sessionKey: string): Promise<SessionPreview> {
    return this.rpcClient.request<SessionPreview>("sessions.preview", { sessionKey });
  }

  async channelsStatus(): Promise<ChannelInfo[]> {
    return this.rpcClient.request<ChannelInfo[]>("channels.status", { probe: true });
  }

  async skillsStatus(): Promise<SkillInfo[]> {
    const result = await this.rpcClient.request<{ skills?: SkillInfo[] }>("skills.status");
    return result.skills ?? [];
  }

  async cronList(): Promise<CronTask[]> {
    return this.rpcClient.request<CronTask[]>("cron.list");
  }

  async cronAdd(input: CronTaskInput): Promise<CronTask> {
    return this.rpcClient.request<CronTask>("cron.add", input as unknown as Record<string, unknown>);
  }

  async cronUpdate(id: string, patch: Partial<CronTaskInput>): Promise<CronTask> {
    return this.rpcClient.request<CronTask>("cron.update", { id, ...patch });
  }

  async cronRemove(id: string): Promise<void> {
    await this.rpcClient.request("cron.remove", { id });
  }

  async cronRun(id: string): Promise<void> {
    await this.rpcClient.request("cron.run", { id });
  }

  async agentsList(): Promise<AgentsListResponse> {
    return this.rpcClient.request<AgentsListResponse>("agents.list");
  }

  async toolsCatalog(): Promise<ToolCatalog> {
    return this.rpcClient.request<ToolCatalog>("tools.catalog");
  }

  async usageStatus(): Promise<UsageInfo> {
    return this.rpcClient.request<UsageInfo>("usage.status");
  }
}
