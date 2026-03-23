export interface TeamConfig {
  id: string;
  name: string;
  emoji: string;
  channelId: string;
  accentColor: string;
}

const ACCENT_COLORS = [
  '#f97316', '#06b6d4', '#8b5cf6', '#22c55e',
  '#ec4899', '#f59e0b', '#3b82f6', '#10b981',
  '#ef4444', '#a855f7', '#14b8a6', '#f43f5e',
];

function hashTeamColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return ACCENT_COLORS[hash % ACCENT_COLORS.length];
}

export const TEAMS: TeamConfig[] = [
  { id: 'epcguide',   name: 'EPCGuide',   emoji: '📚', channelId: '1483195136669384804', accentColor: '' },
  { id: 'thingiverse',name: 'Thingiverse',emoji: '🦊', channelId: '1474492218398998538', accentColor: '' },
  { id: 'bookerbot',  name: 'BookerBot',  emoji: '🎯', channelId: '1484086985797926982', accentColor: '' },
  { id: 'supa',       name: 'Supa',       emoji: '⚡', channelId: '1484210152172163234', accentColor: '' },
  { id: 'vidforge',   name: 'VidForge',   emoji: '🎬', channelId: '1484217772757094501', accentColor: '' },
  { id: 'levity',     name: 'Levity',     emoji: '📈', channelId: '1484278127273443580', accentColor: '' },
  { id: 'brainspace', name: 'BrainSpace', emoji: '🧠', channelId: '1484299746075218061', accentColor: '' },
  { id: 'pitchsite',  name: 'PitchSite',  emoji: '🚀', channelId: '1484497890087931904', accentColor: '' },
  { id: 'family',     name: 'Family',     emoji: '🏡', channelId: '1474492129211584573', accentColor: '' },
  { id: 'personal',   name: 'Personal',   emoji: '🗺️', channelId: '1485567270855118898', accentColor: '' },
].map(t => ({ ...t, accentColor: hashTeamColor(t.id) }));

export function getTeamById(id: string): TeamConfig | undefined {
  return TEAMS.find(t => t.id === id);
}
