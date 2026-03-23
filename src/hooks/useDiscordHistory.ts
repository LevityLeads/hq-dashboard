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

export function useDiscordHistory(channelId: string, active: boolean) {
  const [messages, setMessages] = useState<ParsedMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!channelId || !active) return;
    try {
      setLoading(true);
      // Use Vercel serverless proxy to avoid CORS issues with Discord API
      const res = await fetch(`/api/discord-messages?channelId=${channelId}&limit=20`);
      if (!res.ok) {
        setError('History unavailable');
        return;
      }
      const data = await res.json() as Array<{ id: string; content: string; timestamp: string }>;
      // Show ALL messages, not just ones with role headers
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
        .slice(0, 5);

      setMessages(parsed);
      setError(null);
    } catch {
      setError('History unavailable');
    } finally {
      setLoading(false);
    }
  }, [channelId, active]);

  useEffect(() => {
    if (!active) return;
    fetchMessages();
    const interval = setInterval(fetchMessages, 30_000);
    return () => clearInterval(interval);
  }, [fetchMessages, active]);

  return { messages, loading, error };
}
