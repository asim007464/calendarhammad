import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";
import { normalizeActivityBody } from "@/lib/activity-api";
import { isAdminEmail } from "@/lib/admin";
import { notifyAdminEmail, sendAdminActivityNotificationEmail } from "@/lib/mail";
import type { Activity } from "@/types/database";
const DEMO_ACTIVITIES: Activity[] = [
  {
    id: "demo-1",
    type_name: "Contest",
    name: "CQ WW DX Contest",
    description: "Worldwide DX contest, SSB and CW weekends.",
    callsign: "Various",
    start_at: new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 15, 12, 0)).toISOString(),
    end_at: new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 16, 12, 0)).toISOString(),
    recurrence: "annual",
    bands: ["20m", "40m", "15m"],
    modes: ["SSB", "CW"],
    country: "Worldwide",
    status: "published",
  },
];

export async function GET() {
  try {
    if (!isSupabaseConfigured()) return NextResponse.json(DEMO_ACTIVITIES);

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("activities")
      .select("*, profiles(name, callsign)")
      .eq("status", "published")
      .order("start_at", { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data || []);
  } catch {
    return NextResponse.json(DEMO_ACTIVITIES);
  }
}

export async function POST(request: Request) {
  const raw = await request.json();
  const body = normalizeActivityBody(raw);

  if (!body.name) {
    return NextResponse.json({ error: "Activity name is required" }, { status: 400 });
  }
  if (!body.start_at) {
    return NextResponse.json({ error: "Start date/time is required" }, { status: 400 });
  }

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "You must be signed in to publish an activity." },
        { status: 401 }
      );
    }

    const admin = createAdminClient();

    const { data: profile } = await admin
      .from("profiles")
      .select("role, email, name, callsign")
      .eq("id", user.id)
      .maybeSingle();

    const isAdmin =
      isAdminEmail(user.email) ||
      isAdminEmail(profile?.email) ||
      profile?.role === "admin";

    const status = isAdmin ? "published" : "pending_review";

    const { data, error } = await admin
      .from("activities")
      .insert({
        ...body,
        user_id: user.id,
        status,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    await admin.from("activity_logs").insert({
      activity_id: data.id,
      user_id: user?.id || null,
      event_type: "social_post",
      metadata: { action: "created", status },
    });

    await notifyAdminEmail((to) =>
      sendAdminActivityNotificationEmail({
        to,
        activityId: data.id,
        activityName: data.name,
        activityType: data.type_name || "Other",
        submitterName: profile?.name || user.email?.split("@")[0] || "User",
        submitterEmail: profile?.email || user.email || "",
        callsign: data.callsign || profile?.callsign || undefined,
        status: status as "published" | "pending_review",
        startAt: data.start_at,
        country: data.country || undefined,
      })
    );

    if (status === "published") {
      fetch(`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/social/post`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activity_id: data.id }),
      }).catch(() => {});
    }

    return NextResponse.json(
      {
        ...data,
        pendingApproval: status === "pending_review",
        message:
          status === "pending_review"
            ? "Activity submitted for admin approval. It will appear on the site once approved."
            : "Activity published.",
      },
      { status: 201 }
    );  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
