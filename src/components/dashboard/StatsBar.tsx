import { Activity, Cpu, DollarSign, AlertTriangle, Wifi, WifiOff, Loader } from 'lucide-react';
import { formatTokens, formatCost } from '@/lib/formatters';
import type { ConnectionStatus } from '@/store/dashboardStore';

interface StatsBarProps {
  activeSessions: number;
  totalTokens: number;
  errorCount: number;
  connectionStatus: ConnectionStatus;
}

export function StatsBar({ activeSessions, totalTokens, errorCount, connectionStatus }: StatsBarProps) {
  return (
    <div style={{
      height: 52,
      background: '#0f0f0f',
      borderBottom: '1px solid #222',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      flexShrink: 0,
      position: 'sticky',
      top: 0,
      zIndex: 20,
    }}>
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 16, fontWeight: 600, color: '#f5f5f5', fontFamily: 'Inter, sans-serif', letterSpacing: '-0.02em' }}>
          HQ Dashboard
        </span>
        <ConnectionBadge status={connectionStatus} />
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
        <StatItem
          icon={<Activity size={14} color="#22c55e" />}
          value={String(activeSessions)}
          label="active"
          valueColor="#22c55e"
        />
        <StatItem
          icon={<Cpu size={14} color="#888" />}
          value={formatTokens(totalTokens)}
          label="tokens"
        />
        <StatItem
          icon={<DollarSign size={14} color="#888" />}
          value={formatCost(totalTokens)}
          label="est. cost"
        />
        <StatItem
          icon={<AlertTriangle size={14} color={errorCount > 0 ? '#ef4444' : '#555'} />}
          value={String(errorCount)}
          label="errors"
          valueColor={errorCount > 0 ? '#ef4444' : '#555'}
        />
      </div>
    </div>
  );
}

function StatItem({ icon, value, label, valueColor = '#f5f5f5' }: {
  icon: React.ReactNode;
  value: string;
  label: string;
  valueColor?: string;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      {icon}
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: valueColor, fontWeight: 500 }}>
        {value}
      </span>
      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#555' }}>
        {label}
      </span>
    </div>
  );
}

function ConnectionBadge({ status }: { status: ConnectionStatus }) {
  if (status === 'connected') {
    return (
      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#555', fontFamily: 'Inter, sans-serif' }}>
        <Wifi size={10} color="#22c55e" />
      </span>
    );
  }
  if (status === 'connecting') {
    return (
      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#eab308', fontFamily: 'Inter, sans-serif' }}>
        <Loader size={10} color="#eab308" className="animate-spin" />
        connecting...
      </span>
    );
  }
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#ef4444', fontFamily: 'Inter, sans-serif' }}>
      <WifiOff size={10} color="#ef4444" />
      offline
    </span>
  );
}
