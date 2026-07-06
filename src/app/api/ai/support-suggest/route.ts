import { NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/adminAuth";
import { createAdminClient } from "@/lib/supabase/admin";
import { suggestSupportReply } from "@/lib/openai";

export async function POST(request: Request) {
  const session = await verifyAdminSession(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const id = String(body.id ?? "");
    if (!id) return NextResponse.json({ error: "Message id required." }, { status: 400 });

    const admin = createAdminClient();
    const { data: msg } = await admin.from("support_messages").select("*").eq("id", id).maybeSingle();
    if (!msg) return NextResponse.json({ error: "Message not found." }, { status: 404 });

    const suggestion = await suggestSupportReply({
      subject: msg.subject,
      message: msg.message,
      userName: msg.user_name,
      email: msg.email,
    });

    await admin.from("support_messages").update({ ai_suggested_reply: suggestion }).eq("id", id);

    return NextResponse.json({ suggestion });
  } catch (err) {
    console.error("AI support suggest error:", err);
    return NextResponse.json({ error: "Could not generate suggestion." }, { status: 503 });
  }
}
