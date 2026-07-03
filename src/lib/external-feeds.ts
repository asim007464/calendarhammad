import type { ExternalFeedItem } from "@/types/database";

export async function fetchEhamHubFeed(username: string, apiKey?: string): Promise<ExternalFeedItem[]> {
  // eHamHub API placeholder — replace with real endpoint when available
  if (!apiKey) {
    return [
      {
        id: "demo-1",
        feed_id: "",
        title: `eHamHub activity for ${username}`,
        summary: "Connect your eHamHub API key to sync real posts and statistics.",
        url: "https://ehamhub.com",
        published_at: new Date().toISOString(),
      },
    ];
  }
  try {
    const res = await fetch(`https://api.ehamhub.com/v1/users/${username}/activity`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      next: { revalidate: 300 },
    });
    if (!res.ok) throw new Error("eHamHub API error");
    const data = await res.json();
    return (data.items || []).map((item: { id: string; title: string; summary?: string; url?: string; published_at?: string }) => ({
      id: item.id,
      feed_id: "",
      title: item.title,
      summary: item.summary,
      url: item.url,
      published_at: item.published_at,
    }));
  } catch {
    return [];
  }
}

export async function fetchCQHamsFeed(username: string, apiKey?: string): Promise<ExternalFeedItem[]> {
  if (!apiKey) {
    return [
      {
        id: "demo-1",
        feed_id: "",
        title: `CQHams feed for ${username}`,
        summary: "Connect your CQHams API key to pull recent posts and QSO stats.",
        url: "https://cqhams.com",
        published_at: new Date().toISOString(),
      },
    ];
  }
  try {
    const res = await fetch(`https://api.cqhams.com/v1/feeds/${username}`, {
      headers: { "X-API-Key": apiKey },
      next: { revalidate: 300 },
    });
    if (!res.ok) throw new Error("CQHams API error");
    const data = await res.json();
    return (data.posts || []).map((item: { id: string; title: string; body?: string; link?: string; date?: string }) => ({
      id: item.id,
      feed_id: "",
      title: item.title,
      summary: item.body,
      url: item.link,
      published_at: item.date,
    }));
  } catch {
    return [];
  }
}
