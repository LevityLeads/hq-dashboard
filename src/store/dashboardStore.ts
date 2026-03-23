import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { ParsedRole } from '@/lib/roleParser';

export type AgentStatus = 'thinking' | 'tool_calling' | 'speaking' | 'idle' | 'error' | 'offline';

export interface AgentState {
  agentId: string;
  status: AgentStatus;
  currentRole: ParsedRole | null;
  currentAction: string;
  currentTool: string | null;
  lastSpeech: string;
  tokenCount: number;
  lastActiveAt: number;
  sessionStartAt: number;
  sessionKey: string;
  errorMessage: string;
}

export interface FeedEvent {
  id: string;
  teamId: string;
  teamName: string;
  teamEmoji: string;
  teamAccent: string;
  role: string | null;
  action: string;
  status: AgentStatus;
  ts: number;
}

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

interface DashboardState {
  connectionStatus: ConnectionStatus;
  connectionError: string | null;
  agents: Record<string, AgentState>;
  feedEvents: FeedEvent[];
  feedPaused: boolean;
  globalTokens: number;
  activeSessions: number;
  errorCount: number;

  // Actions
  setConnectionStatus: (status: ConnectionStatus, error?: string) => void;
  upsertAgent: (agentId: string, update: Partial<AgentState>) => void;
  initAgent: (agentId: string) => void;
  addFeedEvent: (event: FeedEvent) => void;
  toggleFeedPaused: () => void;
  setGlobalMetrics: (tokens: number, activeSessions: number, errorCount: number) => void;
  deferredSetIdle: (agentId: string) => void;
}

function makeDefaultAgent(agentId: string): AgentState {
  return {
    agentId,
    status: 'offline',
    currentRole: null,
    currentAction: 'offline',
    currentTool: null,
    lastSpeech: '',
    tokenCount: 0,
    lastActiveAt: 0,
    sessionStartAt: 0,
    sessionKey: '',
    errorMessage: '',
  };
}

export const useDashboardStore = create<DashboardState>()(
  immer((set) => ({
    connectionStatus: 'connecting',
    connectionError: null,
    agents: {},
    feedEvents: [],
    feedPaused: false,
    globalTokens: 0,
    activeSessions: 0,
    errorCount: 0,

    setConnectionStatus: (status, error) =>
      set(state => {
        state.connectionStatus = status;
        state.connectionError = error ?? null;
      }),

    upsertAgent: (agentId, update) =>
      set(state => {
        if (!state.agents[agentId]) {
          state.agents[agentId] = makeDefaultAgent(agentId);
        }
        Object.assign(state.agents[agentId], update);
      }),

    initAgent: (agentId) =>
      set(state => {
        if (!state.agents[agentId]) {
          state.agents[agentId] = makeDefaultAgent(agentId);
        }
        // Mark as idle (online but no activity)
        if (state.agents[agentId].status === 'offline') {
          state.agents[agentId].status = 'idle';
          state.agents[agentId].currentAction = 'idle';
        }
      }),

    addFeedEvent: (event) =>
      set(state => {
        if (state.feedPaused) return;
        state.feedEvents.unshift(event);
        if (state.feedEvents.length > 50) {
          state.feedEvents = state.feedEvents.slice(0, 50);
        }
      }),

    toggleFeedPaused: () =>
      set(state => { state.feedPaused = !state.feedPaused; }),

    setGlobalMetrics: (tokens, activeSessions, errorCount) =>
      set(state => {
        state.globalTokens = tokens;
        state.activeSessions = activeSessions;
        state.errorCount = errorCount;
      }),

    deferredSetIdle: (agentId) =>
      set(state => {
        const agent = state.agents[agentId];
        if (agent) {
          agent.status = 'idle';
          agent.currentAction = 'idle';
          agent.currentTool = null;
        }
      }),
  }))
);
