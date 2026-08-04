import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizeActivityBody } from "@/lib/activity-api";
import { verifyAdminSession } from "@/lib/adminAuth";
import { isAdminEmail } from "@/lib/admin";

async function resolveEditor(request: Request) {
  const adminSession = await verifyAdminSession(request);
  if (adminSession) {
    return { userId: adminSession.user.id, isAdmin: true as const };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("role, email, is_blocked")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.is_blocked) return null;

  const isAdmin =
    isAdminEmail(user.email) ||
    isAdminEmail(profile?.email) ||
    profile?.role === "admin";

  return { userId: user.id, isAdmin };
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const editor = await resolveEditor(request);
  if (!editor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const raw = await request.json();
  const body = normalizeActivityBody(raw);

  if (!body.name) {
    return NextResponse.json({ error: "Activity name is required" }, { status: 400 });
  }
  if (!body.start_at) {
    return NextResponse.json({ error: "Start date/time is required" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: existing, error: fetchError } = await admin
    .from("activities")
    .select("id, user_id, status")
    .eq("id", id)
    .maybeSingle();

  if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 400 });
  if (!existing) return NextResponse.json({ error: "Activity not found" }, { status: 404 });

  if (!editor.isAdmin && existing.user_id !== editor.userId) {
    return NextResponse.json({ error: "You can only edit your own activities." }, { status: 403 });
  }

  const updatePayload: Record<string, unknown> = {
    ...body,
    updated_at: new Date().toISOString(),
  };

  // Admins can optionally change status when provided.
  if (editor.isAdmin && typeof raw.status === "string" && raw.status.trim()) {
    const status = raw.status.trim();
    if (["pending_review", "published", "rejected"].includes(status)) {
      updatePayload.status = status;
    }
  }

  const { data, error } = await admin
    .from("activities")
    .update(updatePayload)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await verifyAdminSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const admin = createAdminClient();
  const { error } = await admin.from("activities").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
