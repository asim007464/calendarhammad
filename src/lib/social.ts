import type { Activity } from "@/types/database";
import { fmtUTC } from "./activity-utils";

export function buildSocialText(a: Activity): string {
  const lines = [
    `📻 ${a.name}`,
    `${a.callsign ? `Call: ${a.callsign}, ` : ""}${a.type_name}`,
    `📅 ${fmtUTC(a.start_at)}`,
    a.country ? `📍 ${a.country}` : "",
    a.description ? a.description.slice(0, 200) : "",
    "",
    "Posted on QSO Dates, www.qsodates.com",
    "#HamRadio #AmateurRadio #QSODates",
  ].filter(Boolean);
  return lines.join("\n");
}

export async function postToFacebook(text: string, imageUrl?: string | null) {
  const pageId = process.env.FACEBOOK_PAGE_ID;
  const token = process.env.FACEBOOK_ACCESS_TOKEN;
  if (!pageId || !token) return { ok: false, error: "Facebook not configured" };

  const body: Record<string, string> = { message: text, access_token: token };
  if (imageUrl) body.link = imageUrl;

  const res = await fetch(`https://graph.facebook.com/v19.0/${pageId}/feed`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) return { ok: false, error: data.error?.message || "Facebook post failed" };
  return { ok: true, postId: data.id };
}

export async function postToX(text: string) {
  const key = process.env.X_API_KEY;
  const secret = process.env.X_API_SECRET;
  const token = process.env.X_ACCESS_TOKEN;
  const tokenSecret = process.env.X_ACCESS_TOKEN_SECRET;
  if (!key || !secret || !token || !tokenSecret) {
    return { ok: false, error: "X/Twitter not configured" };
  }

  // OAuth 1.0a requires a signing library in production; queue for now
  return { ok: false, error: "Configure X API credentials. Post queued." };
}

export async function postToInstagram(caption: string, imageUrl?: string | null) {
  const accountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!accountId || !token) return { ok: false, error: "Instagram not configured" };
  if (!imageUrl) return { ok: false, error: "Instagram requires an image" };

  const createRes = await fetch(
    `https://graph.facebook.com/v19.0/${accountId}/media`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image_url: imageUrl, caption, access_token: token }),
    }
  );
  const createData = await createRes.json();
  if (!createRes.ok) return { ok: false, error: createData.error?.message || "IG media failed" };

  const pubRes = await fetch(
    `https://graph.facebook.com/v19.0/${accountId}/media_publish`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ creation_id: createData.id, access_token: token }),
    }
  );
  const pubData = await pubRes.json();
  if (!pubRes.ok) return { ok: false, error: pubData.error?.message || "IG publish failed" };
  return { ok: true, postId: pubData.id };
}

export async function postActivityToSocial(a: Activity) {
  const text = buildSocialText(a);
  const image = a.logo_url || a.image_url;
  const results = await Promise.all([
    postToFacebook(text, image).then((r) => ({ platform: "facebook" as const, ...r })),
    postToInstagram(text, image).then((r) => ({ platform: "instagram" as const, ...r })),
    postToX(text).then((r) => ({ platform: "x" as const, ...r })),
  ]);
  return results;
}
