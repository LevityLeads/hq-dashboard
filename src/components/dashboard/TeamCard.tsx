import { useState } from 'react';
import type { TeamConfig } from '@/lib/teamConfig';
import type { AgentState } from '@/store/dashboardStore';
import { StatusDot } from './StatusDot';
import { RoleBadge } from './RoleBadge';
import { ModelBadge } from './ModelBadge';
import { formatTokens, timeAgo } from '@/lib/formatters';

interface TeamCardProps {
  team: TeamConfig;
  agentState: AgentState | null;
  onClick: () => void;
}

export function TeamCard({ team, agentState, onClick }: TeamCardProps) {
  const [hovered, setHovered] = useState(false);

  const status = agentState?.status ?? 'offline';
  const isActive = ['thinking', 'tool_calling', 'speaking'].includes(status);
  const isError = status === 'error';
  const isOffline = status === 'offline';

  const borderColor = isError ? '#ef444466' : hovered ? '#333' : '#222';
  const bgColor = hovered ? '#161616' : '#111111';

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        background: bgColor,
        border: `1px solid ${borderColor}`,
        borderRadius: 8,
        padding: 16,
        cursor: 'pointer',
        transition: 'background 150ms ease, border-color 150ms ease',
        minHeight: 140,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        overflow: 'hidden',
      }}
    >
      {/* Accent left bar */}
      {!isOffline && (
        <div style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 3,
          background: team.accentColor,
          borderRadius: '8px 0 0 8px',
        }} />
      )}

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: isOffline ? 0 : 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 16 }}>{team.emoji}</span>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600, color: '#f5f5f5' }}>
            {team.name}
          </span>
        </div>
        <StatusDot status={status} />
      </div>

      {/* Role + Model badges */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', paddingLeft: isOffline ? 0 : 4 }}>
        {agentState?.currentRole ? (
          <>
            <RoleBadge role={agentState.currentRole.role} />
            <ModelBadge model={agentState.currentRole.model} />
          </>
        ) : !isOffline ? (
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#555' }}>no role detected</span>
        ) : null}
      </div>

      {/* Current action */}
      <div style={{ flex: 1, paddingLeft: isOffline ? 0 : 4 }}>
        <span style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 13,
          color: isActive ? '#aaa' : '#555',
          fontStyle: isActive ? 'italic' : 'normal',
        }}>
          {agentState?.currentAction ?? 'offline'}
          {agentState?.currentTool ? ` ${agentState.currentTool}` : ''}
          {isError && agentState?.errorMessage ? ` · ${agentState.errorMessage.slice(0, 40)}` : ''}
        </span>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: isOffline ? 0 : 4 }}>
        {agentState && agentState.tokenCount > 0 ? (
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: '#a3e635' }}>
            {formatTokens(agentState.tokenCount)} tokens
          </span>
        ) : (
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: '#444' }}>
            {isOffline ? '—' : '0 tokens'}
          </span>
        )}
        {agentState?.lastActiveAt && agentState.lastActiveAt > 0 ? (
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#444' }}>
            {timeAgo(agentState.lastActiveAt)}
          </span>
        ) : null}
      </div>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div style={{
      background: '#111111',
      border: '1px solid #222',
      borderRadius: 8,
      padding: 16,
      minHeight: 140,
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Shimmer width={120} height={16} />
        <Shimmer width={10} height={10} radius={5} />
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <Shimmer width={60} height={20} />
        <Shimmer width={80} height={20} />
      </div>
      <Shimmer width={140} height={13} />
      <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between' }}>
        <Shimmer width={80} height={11} />
        <Shimmer width={60} height={11} />
      </div>
    </div>
  );
}

function Shimmer({ width, height, radius = 4 }: { width: number; height: number; radius?: number }) {
  return (
    <div style={{
      width,
      height,
      borderRadius: radius,
      background: 'linear-gradient(90deg, #1a1a1a 25%, #222 50%, #1a1a1a 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite',
    }} />
  );
}
