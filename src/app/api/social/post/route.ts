import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { postActivityToSocial } from "@/lib/social";
import type { Activity } from "@/types/database";

export async function POST(request: Request) {
  const { activity_id } = await request.json();
  if (!activity_id) return NextResponse.json({ error: "activity_id required" }, { status: 400 });

  const admin = createAdminClient();
  const { data: activity, error } = await admin
    .from("activities")
    .select("*")
    .eq("id", activity_id)
    .single();

  if (error || !activity) {
    return NextResponse.json({ error: "Activity not found" }, { status: 404 });
  }

  const results = await postActivityToSocial(activity as Activity);

  for (const r of results) {
    await admin.from("social_posts").insert({
      activity_id,
      platform: r.platform,
      status: r.ok ? "posted" : "failed",
      post_id: "postId" in r ? r.postId : null,
      error_message: "error" in r ? r.error : null,
    });
  }

  await admin.from("activity_logs").insert({
    activity_id,
    event_type: "social_post",
    metadata: { platforms: results },
  });

  return NextResponse.json({ results });
}
