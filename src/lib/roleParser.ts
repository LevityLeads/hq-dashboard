// Role header regex — matches: **[CEO] responding...** (Opus 4.6)
const ROLE_HEADER_REGEX = /\*\*\[([^\]]+)\] responding\.\.\.\*\*\s*\(([^)]+)\)/;

export interface ParsedRole {
  role: string;
  model: string;
}

export function parseRoleHeader(text: string): ParsedRole | null {
  const match = text.match(ROLE_HEADER_REGEX);
  if (!match) return null;
  return { role: match[1], model: match[2] };
}

// Strip markdown for display previews
export function stripMarkdown(text: string, maxLen = 100): string {
  return text
    .replace(/\*\*\[([^\]]+)\] responding\.\.\.\*\*\s*\([^)]+\)\s*/g, '') // remove role headers
    .replace(/[*_`~#>]/g, '')           // strip markdown symbols
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links → text
    .replace(/\n+/g, ' ')               // newlines → space
    .trim()
    .slice(0, maxLen);
}

export function getModelType(model: string): 'opus' | 'sonnet' | 'haiku' | 'unknown' {
  const m = model.toLowerCase();
  if (m.includes('opus')) return 'opus';
  if (m.includes('sonnet')) return 'sonnet';
  if (m.includes('haiku')) return 'haiku';
  return 'unknown';
}
