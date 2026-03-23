import { useState, useEffect } from 'react';
import { TEAMS } from '@/lib/teamConfig';
import { useDashboardStore } from '@/store/dashboardStore';
import { TeamCard, SkeletonCard } from './TeamCard';
import { DrillDownPanel } from './DrillDownPanel';

export function TeamGrid() {
  const agents = useDashboardStore(s => s.agents);
  const [showSkeletons, setShowSkeletons] = useState(true);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  // Show skeleton for 1s on first mount
  useEffect(() => {
    const t = setTimeout(() => setShowSkeletons(false), 1000);
    return () => clearTimeout(t);
  }, []);

  const selectedTeam = TEAMS.find(t => t.id === selectedTeamId) ?? null;

  return (
    <>
      <div style={{
        padding: 24,
        overflowY: 'auto',
        flex: 1,
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: 16,
          maxWidth: 1200,
        }}>
          {TEAMS.map(team => {
            if (showSkeletons) return <SkeletonCard key={team.id} />;
            // Match agent by team ID
            const agentEntry = Object.entries(agents).find(([agentId]) =>
              agentId.toLowerCase().includes(team.id.toLowerCase())
            );
            const agentState = agentEntry?.[1] ?? null;
            return (
              <TeamCard
                key={team.id}
                team={team}
                agentState={agentState}
                onClick={() => setSelectedTeamId(team.id)}
              />
            );
          })}
        </div>
      </div>

      {selectedTeam && (
        <DrillDownPanel
          team={selectedTeam}
          agentState={Object.entries(agents).find(([id]) => id.toLowerCase().includes(selectedTeam.id.toLowerCase()))?.[1] ?? null}
          onClose={() => setSelectedTeamId(null)}
        />
      )}
    </>
  );
}
