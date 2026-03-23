import type { VercelRequest, VercelResponse } from '@vercel/node';

const DISCORD_API = 'https://discord.com/api/v10';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { channelId, limit } = req.query;
  const token = process.env.DISCORD_BOT_TOKEN;

  if (!token) {
    return res.status(500).json({ error: 'Bot token not configured' });
  }

  if (!channelId || typeof channelId !== 'string') {
    return res.status(400).json({ error: 'channelId required' });
  }

  const msgLimit = Math.min(Number(limit) || 20, 50);

  try {
    const response = await fetch(
      `${DISCORD_API}/channels/${channelId}/messages?limit=${msgLimit}`,
      { headers: { Authorization: `Bot ${token}` } }
    );

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Discord API error' });
    }

    const data = await response.json();
    res.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate=20');
    return res.status(200).json(data);
  } catch {
    return res.status(500).json({ error: 'Failed to fetch messages' });
  }
}
