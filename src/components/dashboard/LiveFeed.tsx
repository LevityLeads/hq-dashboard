import { Pause, Play } from 'lucide-react';
import { useDashboardStore, type FeedEvent } from '@/store/dashboardStore';
import { timeAgo } from '@/lib/formatters';

export function LiveFeed() {
  const feedEvents = useDashboardStore(s => s.feedEvents);
  const feedPaused = useDashboardStore(s => s.feedPaused);
  const toggleFeedPaused = useDashboardStore(s => s.toggleFeedPaused);

  return (
    <div style={{
      borderLeft: '1px solid #1a1a1a',
      background: '#0a0a0a',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        height: 40,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 12px',
        borderBottom: '1px solid #1a1a1a',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, fontWeight: 600, color: '#555', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Live Feed
          </span>
          {feedPaused && (
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 9, background: '#222', border: '1px solid #333', borderRadius: 3, padding: '1px 5px', color: '#888' }}>
              PAUSED
            </span>
          )}
        </div>
        <button
          onClick={toggleFeedPaused}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
        >
          {feedPaused ? <Play size={14} color="#555" /> : <Pause size={14} color="#555" />}
        </button>
      </div>

      {/* Events */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        position: 'relative',
      }}>
        {feedPaused && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,0,0,0.4)',
            zIndex: 2,
            pointerEvents: 'none',
          }} />
        )}
        {feedEvents.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 120, fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#444' }}>
            No events yet
          </div>
        ) : (
          feedEvents.map((event) => (
            <FeedItem key={event.id} event={event} />
          ))
        )}
      </div>
    </div>
  );
}

function FeedItem({ event }: { event: FeedEvent }) {
  const isActive = ['thinking', 'tool_calling', 'speaking'].includes(event.status);
  const dotColor = isActive ? '#22c55e' : event.status === 'error' ? '#ef4444' : '#444';

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      padding: '8px 12px',
      borderLeft: `3px solid ${event.teamAccent}`,
      cursor: 'default',
      animation: 'slide-in-right 150ms ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: dotColor, flexShrink: 0 }} />
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 500, color: '#d4d4d4' }}>
          {event.teamEmoji} {event.teamName}
        </span>
        {event.role && (
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#666' }}>· [{event.role}]</span>
        )}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#555', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 170 }}>
          {event.action}
        </span>
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: '#333', flexShrink: 0 }}>
          {timeAgo(event.ts)}
        </span>
      </div>
    </div>
  );
}
