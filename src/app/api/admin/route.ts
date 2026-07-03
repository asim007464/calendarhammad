import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyAdminSession } from "@/lib/adminAuth";

const SESSION_MS = 5 * 60 * 1000;

export async function GET(request: Request) {
  const session = await verifyAdminSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const now = Date.now();

  const [sessions, support, activities, users, socialPosts] = await Promise.all([
    admin.from("user_sessions").select("*, profiles(name, callsign)").gte("last_seen", new Date(now - SESSION_MS).toISOString()),
    admin.from("support_messages").select("*").order("created_at", { ascending: false }),
    admin.from("activities").select("*, profiles(name, callsign)").order("created_at", { ascending: false }),
    admin.from("profiles").select("*"),
    admin.from("social_posts").select("*").order("created_at", { ascending: false }).limit(20),
  ]);

  return NextResponse.json({
    online: sessions.data || [],
    support: support.data || [],
    activities: activities.data || [],
    users: users.data || [],
    socialPosts: socialPosts.data || [],
  });
}
