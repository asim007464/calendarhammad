import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/admin";
import { createActivityForUser } from "@/lib/manageActivities";
import type { Activity } from "@/types/database";
const DEMO_ACTIVITIES: Activity[] = [
  {
    id: "demo-1",
    type_name: "Contest",
    name: "CQ WW DX Contest",
    description: "Worldwide DX contest, SSB and CW weekends.",
    callsign: "Various",
    start_at: new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 15, 12, 0)).toISOString(),
    end_at: new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 16, 12, 0)).toISOString(),
    recurrence: "annual",
    bands: ["20m", "40m", "15m"],
    modes: ["SSB", "CW"],
    country: "Worldwide",
    status: "published",
  },
];

export async function GET() {
  try {
    if (!isSupabaseConfigured()) return NextResponse.json(DEMO_ACTIVITIES);

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("activities")
      .select("*, profiles(name, callsign)")
      .eq("status", "published")
      .order("start_at", { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data || []);
  } catch {
    return NextResponse.json(DEMO_ACTIVITIES);
  }
}

export async function POST(request: Request) {
  try {
    const raw = await request.json();
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "You must be signed in to publish an activity." },
        { status: 401 }
      );
    }

    const result = await createActivityForUser(user.id, raw && typeof raw === "object" ? raw : {});
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.statusCode });
    }

    return NextResponse.json(
      {
        ...result.activity,
        pendingApproval: result.pendingApproval,
        message: result.message,
      },
      { status: result.statusCode }
    );
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
