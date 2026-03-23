import type { AgentStatus } from '@/store/dashboardStore';

interface StatusDotProps {
  status: AgentStatus;
  size?: number;
}

const STATUS_COLORS: Record<AgentStatus, string> = {
  thinking: '#22c55e',
  tool_calling: '#22c55e',
  speaking: '#22c55e',
  idle: '#eab308',
  error: '#ef4444',
  offline: '#444444',
};

export function StatusDot({ status, size = 10 }: StatusDotProps) {
  const color = STATUS_COLORS[status];
  const isActive = ['thinking', 'tool_calling', 'speaking'].includes(status);

  return (
    <span
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: color,
        flexShrink: 0,
        animation: isActive ? 'pulse-ring 2s ease-in-out infinite' : 'none',
      }}
    />
  );
}
