import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminEmail } from "@/lib/admin";
import { fetchCQHamsFeed, fetchEhamHubFeed } from "@/lib/external-feeds";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email || !isAdminEmail(user.email)) {
    return null;
  }
  return user;
}

export async function GET() {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Admin access required" }, { status: 403 });

  const admin = createAdminClient();
  const { data: feeds } = await admin.from("external_feeds").select("*").eq("user_id", user.id);
  const feedIds = (feeds || []).map((f) => f.id);
  const { data: items } = feedIds.length
    ? await admin.from("external_feed_items").select("*").in("feed_id", feedIds).order("published_at", { ascending: false }).limit(20)
    : { data: [] };

  return NextResponse.json({ feeds: feeds || [], items: items || [] });
}

export async function POST(request: Request) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Admin access required" }, { status: 403 });

  const { platform, username, api_key, action } = await request.json();
  const admin = createAdminClient();

  if (action === "sync") {
    const { data: feed } = await admin
      .from("external_feeds")
      .select("*")
      .eq("user_id", user.id)
      .eq("platform", platform)
      .single();

    if (!feed) return NextResponse.json({ error: "Feed not connected" }, { status: 404 });

    const items =
      platform === "ehamhub"
        ? await fetchEhamHubFeed(feed.username || "", api_key || feed.api_key_encrypted || undefined)
        : await fetchCQHamsFeed(feed.username || "", api_key || feed.api_key_encrypted || undefined);

    await admin.from("external_feed_items").delete().eq("feed_id", feed.id);
    for (const item of items) {
      await admin.from("external_feed_items").insert({
        feed_id: feed.id,
        external_id: item.id,
        title: item.title,
        summary: item.summary,
        url: item.url,
        published_at: item.published_at,
      });
    }
    await admin.from("external_feeds").update({ last_sync_at: new Date().toISOString(), last_error: null }).eq("id", feed.id);
    return NextResponse.json({ synced: items.length });
  }

  const { data, error } = await admin
    .from("external_feeds")
    .upsert({
      user_id: user.id,
      platform,
      username,
      api_key_encrypted: api_key || null,
      is_active: true,
    }, { onConflict: "user_id,platform" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function DELETE(request: Request) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Admin access required" }, { status: 403 });

  const { platform } = await request.json();
  const admin = createAdminClient();
  await admin.from("external_feeds").delete().eq("user_id", user.id).eq("platform", platform);
  return NextResponse.json({ ok: true });
}
