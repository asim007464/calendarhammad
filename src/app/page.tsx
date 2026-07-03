import { HomeClient } from "@/components/HomeClient";
import { createClient } from "@/lib/supabase/server";
import type { Activity, ActivityType, Broadcast } from "@/types/database";
import { TYPE_COLORS } from "@/types/database";
import { slugify } from "@/lib/activity-utils";

const DEMO_ACTIVITIES: Activity[] = [
  {
    id: "demo-1",
    type_name: "Contest",
    name: "CQ WW DX Contest",
    description: "Worldwide DX contest — SSB and CW weekends.",
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

const DEFAULT_TYPES: ActivityType[] = Object.keys(TYPE_COLORS).map((name) => ({
  id: `default-${slugify(name)}`,
  name,
  slug: slugify(name),
  color: TYPE_COLORS[name],
  is_system: true,
}));

async function getActivities(): Promise<Activity[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("activities")
      .select("*, profiles(name, callsign)")
      .eq("status", "published")
      .order("start_at", { ascending: true });
    return data?.length ? data : DEMO_ACTIVITIES;
  } catch {
    return DEMO_ACTIVITIES;
  }
}

async function getActivityTypes(): Promise<ActivityType[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("activity_types").select("*").order("name");
    return data?.length ? data : DEFAULT_TYPES;
  } catch {
    return DEFAULT_TYPES;
  }
}

async function getBroadcast(): Promise<Broadcast | null> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("broadcasts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
    return data;
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const [activities, activityTypes, broadcast] = await Promise.all([
    getActivities(),
    getActivityTypes(),
    getBroadcast(),
  ]);

  return <HomeClient initialActivities={activities} activityTypes={activityTypes} broadcast={broadcast} />;
}
