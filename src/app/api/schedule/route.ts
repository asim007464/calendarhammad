import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") || "monthly";

  try {
    const supabase = await createClient();
    const now = new Date();
    let start: Date;
    let end: Date;

    if (period === "weekly") {
      start = new Date(now);
      start.setUTCDate(now.getUTCDate() - now.getUTCDay() + 1);
      start.setUTCHours(0, 0, 0, 0);
      end = new Date(start);
      end.setUTCDate(start.getUTCDate() + 7);
    } else {
      start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
      end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59));
    }

    const { data, error } = await supabase
      .from("activities")
      .select("*")
      .eq("status", "published")
      .gte("start_at", start.toISOString())
      .lte("start_at", end.toISOString())
      .order("start_at");

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    const recurring = await supabase
      .from("activities")
      .select("*")
      .eq("status", "published")
      .in("recurrence", ["annual", "weekly", "monthly"]);

    return NextResponse.json({
      period,
      range: { start: start.toISOString(), end: end.toISOString() },
      scheduled: data || [],
      recurring: recurring.data || [],
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
