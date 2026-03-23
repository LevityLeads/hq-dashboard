import { useEffect } from 'react';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import type { TeamConfig } from '@/lib/teamConfig';
import type { AgentState } from '@/store/dashboardStore';
import { useDiscordHistory } from '@/hooks/useDiscordHistory';
import { StatusDot } from './StatusDot';
import { RoleBadge } from './RoleBadge';
import { ModelBadge } from './ModelBadge';
import { formatTokens, formatDuration } from '@/lib/formatters';

interface DrillDownPanelProps {
  team: TeamConfig;
  agentState: AgentState | null;
  onClose: () => void;
}

export function DrillDownPanel({ team, agentState, onClose }: DrillDownPanelProps) {
  const { messages, loading, error } = useDiscordHistory(team.channelId, true);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const status = agentState?.status ?? 'offline';

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.6)',
          zIndex: 49,
        }}
      />
      {/* Panel */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: 520,
        background: '#0f0f0f',
        borderLeft: '1px solid #222',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        animation: 'slide-in-panel 200ms ease-out',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          height: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          borderBottom: '1px solid #222',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
              <ArrowLeft size={20} color="#888" />
            </button>
            <span style={{ fontSize: 18 }}>{team.emoji}</span>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 18, fontWeight: 600, color: '#f5f5f5' }}>
              {team.name}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <StatusDot status={status} size={8} />
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 500, color: status === 'offline' ? '#444' : status === 'error' ? '#ef4444' : '#22c55e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {status}
            </span>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          {/* Live Status */}
          <div style={{ padding: 24, borderBottom: '1px solid #1a1a1a' }}>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, fontWeight: 600, color: '#555', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
              Live Status
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              {agentState?.currentRole ? (
                <>
                  <RoleBadge role={agentState.currentRole.role} />
                  <ModelBadge model={agentState.currentRole.model} />
                </>
              ) : (
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#555' }}>No active role</span>
              )}
              {agentState?.currentTool && (
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#888' }}>
                  🔧 {agentState.currentTool} running...
                </span>
              )}
            </div>

            {/* Speech bubble */}
            <div style={{
              marginTop: 16,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid #2a2a2a',
              borderRadius: 8,
              padding: '14px 16px',
              display: 'flex',
              gap: 8,
              alignItems: 'flex-start',
            }}>
              <MessageSquare size={14} color="#444" style={{ flexShrink: 0, marginTop: 2 }} />
              {agentState?.lastSpeech ? (
                <span style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 13,
                  color: '#c5c5c5',
                  lineHeight: 1.6,
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}>
                  {agentState.lastSpeech}
                </span>
              ) : (
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#444', fontStyle: 'italic' }}>
                  Waiting for response...
                </span>
              )}
            </div>
          </div>

          {/* Role History */}
          <div style={{ padding: 24, flex: 1 }}>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, fontWeight: 600, color: '#555', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
              History
            </div>

            {loading && (
              <>
                {[1,2,3].map(i => (
                  <div key={i} style={{ marginBottom: 16 }}>
                    <div style={{ height: 16, background: '#1a1a1a', borderRadius: 4, marginBottom: 8, width: 200 }} />
                    <div style={{ height: 13, background: '#161616', borderRadius: 4, width: '80%' }} />
                  </div>
                ))}
              </>
            )}

            {error && (
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#555', fontStyle: 'italic' }}>
                History unavailable
              </span>
            )}

            {!loading && !error && messages.length === 0 && (
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#555', fontStyle: 'italic' }}>
                No role messages found
              </span>
            )}

            {!loading && messages.map((msg, idx) => (
              <div key={msg.id}>
                {idx > 0 && <div style={{ height: 1, background: '#1e1e1e', margin: '12px 0' }} />}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                  {msg.role && <RoleBadge role={msg.role} small />}
                  {msg.model && <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#666' }}>{msg.model}</span>}
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#444' }}>·</span>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#555' }}>{msg.timeAgoStr}</span>
                </div>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#888', margin: 0, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  &ldquo;{msg.preview || '(no preview)'}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Session Stats */}
        {agentState && (
          <div style={{
            background: '#0a0a0a',
            borderTop: '1px solid #1a1a1a',
            padding: '16px 24px',
            display: 'flex',
            gap: 32,
            flexShrink: 0,
          }}>
            <StatCell label="Tokens" value={formatTokens(agentState.tokenCount)} mono />
            <StatCell label="Started" value={agentState.sessionStartAt > 0 ? formatDuration(agentState.sessionStartAt) + ' ago' : '—'} />
            <StatCell label="Session" value={agentState.sessionKey ? agentState.sessionKey.slice(0, 8) + '...' : '—'} mono muted />
          </div>
        )}
      </div>
    </>
  );
}

function StatCell({ label, value, mono, muted }: { label: string; value: string; mono?: boolean; muted?: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: '#555', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
      <span style={{ fontFamily: mono ? "'JetBrains Mono', monospace" : 'Inter, sans-serif', fontSize: 13, color: muted ? '#555' : mono ? '#a3e635' : '#d4d4d4' }}>{value}</span>
    </div>
  );
}
