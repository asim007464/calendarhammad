import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyAdminSession } from "@/lib/adminAuth";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await verifyAdminSession(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const action = String(body.action ?? "");

  if (!["approve", "reject"].includes(action)) {
    return NextResponse.json({ error: "action must be approve or reject" }, { status: 400 });
  }

  const admin = createAdminClient();
  const status = action === "approve" ? "published" : "rejected";

  const { data, error } = await admin
    .from("activities")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  if (action === "approve" && data) {
    fetch(`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/social/post`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activity_id: data.id }),
    }).catch(() => {});
  }

  return NextResponse.json({ ok: true, activity: data });
}
