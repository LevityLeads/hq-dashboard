import { Monitor } from 'lucide-react';
import { useDashboardGateway } from '@/hooks/useDashboardGateway';
import { useDashboardStore } from '@/store/dashboardStore';
import { StatsBar } from '@/components/dashboard/StatsBar';
import { TeamGrid } from '@/components/dashboard/TeamGrid';
import { LiveFeed } from '@/components/dashboard/LiveFeed';

function resolveGatewayWsUrl(base: string): string {
  const v = (base || '').trim();
  if (v.startsWith('ws://') || v.startsWith('wss://')) return v + '/gateway-ws';
  if (v.startsWith('http://') || v.startsWith('https://')) {
    const u = new URL(v);
    u.protocol = u.protocol === 'https:' ? 'wss:' : 'ws:';
    return u.toString() + '/gateway-ws';
  }
  return 'ws://localhost:18789/gateway-ws';
}

export function App() {
  const injected = (window as unknown as Record<string, unknown>).__OPENCLAW_CONFIG__ as
    | { gatewayUrl?: string; gatewayToken?: string }
    | undefined;

  const gatewayBase = injected?.gatewayUrl || import.meta.env.VITE_GATEWAY_URL || 'ws://localhost:18789';
  const gatewayUrl = resolveGatewayWsUrl(gatewayBase);
  const gatewayToken = injected?.gatewayToken || import.meta.env.VITE_GATEWAY_TOKEN || '';

  useDashboardGateway(gatewayUrl, gatewayToken);

  const connectionStatus = useDashboardStore(s => s.connectionStatus);
  const activeSessions = useDashboardStore(s => s.activeSessions);
  const globalTokens = useDashboardStore(s => s.globalTokens);
  const errorCount = useDashboardStore(s => s.errorCount);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#0a0a0a' }}>
      {/* Mobile gate */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0a0a; color: #f5f5f5; }

        @keyframes pulse-ring {
          0%   { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
          70%  { box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); }
          100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
        }
        @keyframes slide-in-right {
          from { transform: translateX(8px); opacity: 0; }
          to   { transform: translateX(0);   opacity: 1; }
        }
        @keyframes slide-in-panel {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }
        ::-webkit-scrollbar-thumb:hover { background: #444; }

        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        .mobile-gate { display: none; }
        @media (max-width: 1023px) {
          .desktop-layout { display: none !important; }
          .mobile-gate { display: flex !important; }
        }
      `}</style>

      {/* Mobile gate */}
      <div className="mobile-gate" style={{
        position: 'fixed', inset: 0, background: '#0a0a0a',
        flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, zIndex: 100,
      }}>
        <Monitor size={48} color="#444" />
        <h2 style={{ fontFamily: 'Inter, sans-serif', fontSize: 20, color: '#888', fontWeight: 600 }}>Open on desktop</h2>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#555' }}>HQ Dashboard requires a screen at least 1024px wide.</p>
      </div>

      {/* Gateway offline banner */}
      {(connectionStatus === 'disconnected' || connectionStatus === 'error') && (
        <div style={{
          background: '#1a0a0a', borderBottom: '1px solid #3a1a1a',
          padding: '8px 24px', display: 'flex', alignItems: 'center', gap: 8,
          fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#ef4444',
        }}>
          <span>⚠</span>
          Gateway offline — reconnecting...
          <span style={{ marginLeft: 8, display: 'inline-block', width: 12, height: 12, border: '2px solid #ef4444', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
      )}

      {/* Desktop layout */}
      <div className="desktop-layout" style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
        <StatsBar
          activeSessions={activeSessions}
          totalTokens={globalTokens}
          errorCount={errorCount}
          connectionStatus={connectionStatus}
        />
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 280px', overflow: 'hidden' }}>
          <TeamGrid />
          <LiveFeed />
        </div>
      </div>
    </div>
  );
}
