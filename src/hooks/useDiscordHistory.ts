import { useState, useEffect, useCallback } from 'react';
import { parseRoleHeader, stripMarkdown } from '@/lib/roleParser';
import { timeAgo } from '@/lib/formatters';

export interface ParsedMessage {
  id: string;
  role: string | null;
  model: string | null;
  preview: string;
  rawContent: string;
  ts: number;
  timeAgoStr: string;
}

const DISCORD_API = 'https://discord.com/api/v10';

export function useDiscordHistory(channelId: string, active: boolean) {
  const [messages, setMessages] = useState<ParsedMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = import.meta.env.VITE_DISCORD_BOT_TOKEN ?? '';

  const fetchMessages = useCallback(async () => {
    if (!channelId || !token || !active) return;
    try {
      setLoading(true);
      const res = await fetch(`${DISCORD_API}/channels/${channelId}/messages?limit=20`, {
        headers: { 'Authorization': `Bot ${token}` },
      });
      if (!res.ok) {
        setError('History unavailable');
        return;
      }
      const data = await res.json() as Array<{ id: string; content: string; timestamp: string }>;
      // Filter only messages that have a role header
      const parsed: ParsedMessage[] = data
        .map(msg => {
          const parsedRole = parseRoleHeader(msg.content);
          const ts = new Date(msg.timestamp).getTime();
          return {
            id: msg.id,
            role: parsedRole?.role ?? null,
            model: parsedRole?.model ?? null,
            preview: stripMarkdown(msg.content, 120),
            rawContent: msg.content,
            ts,
            timeAgoStr: timeAgo(ts),
          };
        })
        .filter(m => m.role !== null) // only role-header messages
        .slice(0, 5);

      setMessages(parsed);
      setError(null);
    } catch {
      setError('History unavailable');
    } finally {
      setLoading(false);
    }
  }, [channelId, token, active]);

  useEffect(() => {
    if (!active) return;
    fetchMessages();
    const interval = setInterval(fetchMessages, 30_000);
    return () => clearInterval(interval);
  }, [fetchMessages, active]);

  return { messages, loading, error };
}
