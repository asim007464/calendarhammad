import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { slugify } from "@/lib/activity-utils";import { TYPE_COLORS } from "@/types/database";

const DEFAULT_TYPES = Object.keys(TYPE_COLORS).map((name) => ({
  id: `default-${slugify(name)}`,
  name,
  slug: slugify(name),
  color: TYPE_COLORS[name],
  is_system: true,
}));

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("activity_types").select("*").order("name");
    if (error || !data?.length) return NextResponse.json(DEFAULT_TYPES);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(DEFAULT_TYPES);
  }
}

export async function POST(request: Request) {
  const { name, color } = await request.json();
  if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 });

  const slug = slugify(name);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("activity_types")
    .insert({
      name: name.trim(),
      slug,
      color: color || "#64748b",
      created_by: user?.id || null,
    })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}
