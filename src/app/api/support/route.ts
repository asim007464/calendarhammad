import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyAdminSession } from "@/lib/adminAuth";

export async function GET() {
  const admin = createAdminClient();
  const { data } = await admin.from("support_messages").select("*").order("created_at", { ascending: false });
  return NextResponse.json(data || []);
}

export async function POST(request: Request) {
  const body = await request.json();
  const admin = createAdminClient();
  const { data, error } = await admin.from("support_messages").insert({
    user_name: body.user_name || "Guest",
    callsign: body.callsign || "",
    email: body.email || "",
    subject: body.subject,
    message: body.message,
    status: "open",
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
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
