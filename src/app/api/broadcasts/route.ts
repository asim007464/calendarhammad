import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const admin = createAdminClient();
  const { data } = await admin.from("broadcasts").select("*").order("created_at", { ascending: false }).limit(1);
  return NextResponse.json(data?.[0] || null);
}

export async function POST(request: Request) {
  const { title, message, password } = await request.json();
  if (password !== process.env.ADMIN_PASSWORD && password !== "hamcaladmin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const admin = createAdminClient();
  const { data, error } = await admin.from("broadcasts").insert({ title, message }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}
