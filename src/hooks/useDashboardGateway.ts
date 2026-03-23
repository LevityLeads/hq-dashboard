import { useEffect, useRef } from 'react';
import { GatewayWsClient } from '@/gateway/ws-client';
import type { AgentEventPayload, GatewayEventFrame, HealthSnapshot } from '@/gateway/types';
import { parseAgentEvent } from '@/gateway/event-parser';
import { parseRoleHeader } from '@/lib/roleParser';
import { TEAMS } from '@/lib/teamConfig';
import { useDashboardStore } from '@/store/dashboardStore';
import type { AgentStatus, FeedEvent } from '@/store/dashboardStore';

const IDLE_DELAY_MS = 5000;

function getTeamForAgent(agentId: string) {
  // Try to match agent ID to a known team by name substring
  const lower = agentId.toLowerCase();
  return TEAMS.find(t => lower.includes(t.id.toLowerCase())) ?? null;
}

function mapStatus(rawStatus: string): AgentStatus {
  switch (rawStatus) {
    case 'thinking': return 'thinking';
    case 'tool_calling': return 'tool_calling';
    case 'speaking': return 'speaking';
    case 'idle': return 'idle';
    case 'error': return 'error';
    default: return 'idle';
  }
}

export function useDashboardGateway(url: string, token: string) {
  const wsRef = useRef<GatewayWsClient | null>(null);
  const idleTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const setConnectionStatus = useDashboardStore(s => s.setConnectionStatus);
  const upsertAgent = useDashboardStore(s => s.upsertAgent);
  const initAgent = useDashboardStore(s => s.initAgent);
  const addFeedEvent = useDashboardStore(s => s.addFeedEvent);
  const deferredSetIdle = useDashboardStore(s => s.deferredSetIdle);
  const setGlobalMetrics = useDashboardStore(s => s.setGlobalMetrics);

  useEffect(() => {
    if (!url) return;

    const ws = new GatewayWsClient();
    wsRef.current = ws;

    ws.onStatusChange((status, error) => {
      if (status === 'connected') {
        setConnectionStatus('connected');
        // Init agents from snapshot
        const snapshot = ws.getSnapshot();
        const health = (snapshot as Record<string, unknown>)?.health as HealthSnapshot | undefined;
        if (health?.agents) {
          for (const a of health.agents) {
            initAgent(a.agentId);
          }
        }
      } else if (status === 'disconnected' || status === 'error') {
        setConnectionStatus(status === 'error' ? 'error' : 'disconnected', String(error ?? ''));
      } else if (status === 'connecting') {
        setConnectionStatus('connecting');
      }
    });

    ws.onEvent('agent', (frame: GatewayEventFrame) => {
      const payload = frame.payload as AgentEventPayload;
      const parsed = parseAgentEvent(payload);
      // Extract agentId from sessionKey ("agent:levity:discord:..." → "levity")
      const agentId = payload.sessionKey?.split(':')[1] ?? payload.runId ?? 'unknown';
      const team = getTeamForAgent(agentId);
      const status = mapStatus(parsed.status);

      // Parse role from assistant text stream
      let roleUpdate = {};
      if (payload.stream === 'assistant') {
        const text = (payload.data?.text as string) ?? '';
        const parsedRole = parseRoleHeader(text);
        if (parsedRole) {
          roleUpdate = { currentRole: parsedRole };
        }
        // Update speech even if no role header found
        if (text) {
          const fullText = useDashboardStore.getState().agents[agentId]?.lastSpeech ?? '';
          upsertAgent(agentId, {
            lastSpeech: (fullText + text).slice(-500), // keep last 500 chars
            ...roleUpdate,
          });
        }
      }

      // Build action string
      let action = 'idle';
      if (status === 'thinking') action = 'thinking...';
      else if (status === 'tool_calling') action = parsed.currentTool ? `using ${parsed.currentTool.name}` : 'calling tool...';
      else if (status === 'speaking') action = 'responding...';
      else if (status === 'error') action = `error`;
      else if (status === 'idle') action = 'idle';

      // Clear speech + tool on idle
      const clearFields: Record<string, unknown> = {};
      if (status === 'idle') {
        clearFields.currentTool = null;
        // Don't clear speech — keep it for context
      }

      // Handle deferred idle with min display time
      if (status === 'idle') {
        const existing = idleTimers.current.get(agentId);
        if (existing) clearTimeout(existing);
        const timer = setTimeout(() => {
          deferredSetIdle(agentId);
          idleTimers.current.delete(agentId);
        }, IDLE_DELAY_MS);
        idleTimers.current.set(agentId, timer);
      } else {
        const existing = idleTimers.current.get(agentId);
        if (existing) {
          clearTimeout(existing);
          idleTimers.current.delete(agentId);
        }
        upsertAgent(agentId, {
          status,
          currentAction: action,
          currentTool: parsed.currentTool?.name ?? null,
          lastActiveAt: Date.now(),
          ...clearFields,
          ...roleUpdate,
        });
      }

      // Add feed event
      if (status !== 'idle' && team) {
        const feedEvent: FeedEvent = {
          id: `${agentId}-${Date.now()}-${Math.random()}`,
          teamId: team.id,
          teamName: team.name,
          teamEmoji: team.emoji,
          teamAccent: team.accentColor,
          role: useDashboardStore.getState().agents[agentId]?.currentRole?.role ?? null,
          action,
          status,
          ts: Date.now(),
        };
        addFeedEvent(feedEvent);
      }
    });

    ws.onEvent('health', (frame: GatewayEventFrame) => {
      const health = frame.payload as HealthSnapshot;
      if (health?.agents) {
        for (const a of health.agents) {
          initAgent(a.agentId);
        }
        // Compute global metrics
        const allAgents = useDashboardStore.getState().agents;
        let active = 0, errors = 0;
        for (const agent of Object.values(allAgents)) {
          if (['thinking', 'tool_calling', 'speaking'].includes(agent.status)) active++;
          if (agent.status === 'error') errors++;
        }
        const totalTokens = Object.values(allAgents).reduce((sum, a) => sum + a.tokenCount, 0);
        setGlobalMetrics(totalTokens, active, errors);
      }
    });

    ws.onEvent('agentCosts', (frame: GatewayEventFrame) => {
      const costs = frame.payload as Record<string, number> | undefined;
      if (!costs) return;
      for (const [agentId, tokens] of Object.entries(costs)) {
        upsertAgent(agentId, { tokenCount: typeof tokens === 'number' ? tokens : 0 });
      }
      // Recompute global tokens
      const allAgents = useDashboardStore.getState().agents;
      const totalTokens = Object.values(allAgents).reduce((sum, a) => sum + a.tokenCount, 0);
      const active = Object.values(allAgents).filter(a => ['thinking','tool_calling','speaking'].includes(a.status)).length;
      const errors = Object.values(allAgents).filter(a => a.status === 'error').length;
      setGlobalMetrics(totalTokens, active, errors);
    });

    ws.onEvent('globalMetrics', (frame: GatewayEventFrame) => {
      const metrics = frame.payload as { activeAgents?: number; totalTokens?: number } | undefined;
      if (!metrics) return;
      const allAgents = useDashboardStore.getState().agents;
      const errors = Object.values(allAgents).filter(a => a.status === 'error').length;
      setGlobalMetrics(
        metrics.totalTokens ?? 0,
        metrics.activeAgents ?? 0,
        errors,
      );
    });

    ws.connect(url, token);

    return () => {
      for (const timer of idleTimers.current.values()) clearTimeout(timer);
      idleTimers.current.clear();
      ws.disconnect();
      wsRef.current = null;
    };
  }, [url, token, setConnectionStatus, upsertAgent, initAgent, addFeedEvent, deferredSetIdle, setGlobalMetrics]);

  return wsRef;
}
