import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { updateActivityForUser } from "@/lib/manageActivities";
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
  const result = await updateActivityForUser(
    editor.userId,
    id,
    raw && typeof raw === "object" ? raw : {}
  );
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.statusCode });
  }
  return NextResponse.json(result.activity);
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
