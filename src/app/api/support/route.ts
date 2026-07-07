import { NextResponse } from "next/server";
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { verifyAdminSession } from "@/lib/adminAuth";
import { notifyAdminEmail, sendAdminSupportNotificationEmail } from "@/lib/mail";

export async function GET(request: Request) {
  const session = await verifyAdminSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json([]);
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("support_messages")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}

export async function POST(request: Request) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: "Support is temporarily unavailable. Please try again later." },
        { status: 503 },
      );
    }

    const body = await request.json();
    const subject = String(body.subject ?? "").trim();
    const message = String(body.message ?? "").trim();

    if (!subject || !message) {
      return NextResponse.json({ error: "Subject and message are required." }, { status: 400 });
    }

    let userId: string | null = null;
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id ?? null;
    } catch {
      // Guest submission is allowed
    }

    const admin = createAdminClient();
    const { data, error } = await admin
      .from("support_messages")
      .insert({
        user_id: userId,
        user_name: String(body.user_name ?? "").trim() || "Guest",
        callsign: String(body.callsign ?? "").trim(),
        email: String(body.email ?? "").trim(),
        subject,
        message,
        status: "open",
      })
      .select()
      .single();

    if (error) {
      console.error("[support] insert failed:", error.message);
      return NextResponse.json({ error: "Could not save your message. Please try again." }, { status: 500 });
    }

    await notifyAdminEmail((to) =>
      sendAdminSupportNotificationEmail({
        to,
        userName: data.user_name,
        email: data.email,
        subject: data.subject,
        message: data.message,
      })
    );

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error("[support] POST error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await verifyAdminSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, status, reply } = await request.json();
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("support_messages")
    .update({ status, reply })
    .eq("id", id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
