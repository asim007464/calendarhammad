import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyAdminSession } from "@/lib/adminAuth";
import { getHomepageContent, getLockdownSettings } from "@/lib/siteSettings";

const SESSION_MS = 5 * 60 * 1000;

export async function GET(request: Request) {
  const session = await verifyAdminSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const now = Date.now();

  const [sessions, support, activities, users, socialPosts, lockdown, homepage] = await Promise.all([
    admin.from("user_sessions").select("*, profiles(name, callsign)").gte("last_seen", new Date(now - SESSION_MS).toISOString()),
    admin.from("support_messages").select("*").order("created_at", { ascending: false }),
    admin.from("activities").select("*, profiles(name, callsign, email)").order("created_at", { ascending: false }),
    admin.from("profiles").select("*").order("created_at", { ascending: false }),
    admin.from("social_posts").select("*").order("created_at", { ascending: false }).limit(20),
    getLockdownSettings(),
    getHomepageContent(),
  ]);

  const pendingActivities = (activities.data || []).filter((a) => a.status === "pending_review").length;

  return NextResponse.json({
    online: sessions.data || [],
    support: support.data || [],
    activities: activities.data || [],
    users: users.data || [],
    socialPosts: socialPosts.data || [],
    lockdown,
    homepage,
    stats: {
      pendingActivities,
      openSupport: (support.data || []).filter((s) => s.status === "open").length,
      totalUsers: (users.data || []).length,
      totalActivities: (activities.data || []).length,
    },
    session: {
      isSuperAdmin: session.isSuperAdmin,
      name: session.profile.name,
      email: session.profile.email,
    },
  });
}
