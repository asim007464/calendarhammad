import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { event_type, metadata } = await request.json();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  try {
    const admin = createAdminClient();
    await admin.from("activity_logs").insert({
      activity_id: id,
      user_id: user?.id || null,
      event_type: event_type || "view",
      metadata: metadata || {},
    });

    if (event_type === "view") {
      try {
        await admin.rpc("increment_view_count", { activity_id: id });
      } catch {
        // RPC optional
      }
    }
  } catch {
    // logging must not block the UI
  }

  return NextResponse.json({ ok: true });
}
