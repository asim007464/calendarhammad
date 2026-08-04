import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { Activity, ActivityType, Broadcast } from "@/types/database";
import { TYPE_COLORS } from "@/types/database";
import { slugify } from "@/lib/activity-utils";

export const DEMO_ACTIVITIES: Activity[] = [
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

export const DEFAULT_TYPES: ActivityType[] = Object.keys(TYPE_COLORS).map((name) => ({
  id: `default-${slugify(name)}`,
  name,
  slug: slugify(name),
  color: TYPE_COLORS[name],
  is_system: true,
}));

export async function getActivities(): Promise<Activity[]> {
  if (!isSupabaseConfigured()) return DEMO_ACTIVITIES;
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

export async function getActivityTypes(): Promise<ActivityType[]> {
  const defaults = DEFAULT_TYPES;
  if (!isSupabaseConfigured()) return defaults;
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("activity_types").select("*").order("name");
    if (!data?.length) return defaults;
    const byName = new Map<string, ActivityType>();
    for (const t of defaults) byName.set(t.name, t);
    for (const t of data) {
      byName.set(t.name, {
        ...t,
        color: t.color || TYPE_COLORS[t.name] || t.color,
      });
    }
    return Array.from(byName.values()).sort((a, b) => a.name.localeCompare(b.name));
  } catch {
    return defaults;
  }
}

export async function getBroadcast(): Promise<Broadcast | null> {
  if (!isSupabaseConfigured()) return null;
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

export async function loadCalendarPageData() {
  const [activities, activityTypes, broadcast] = await Promise.all([
    getActivities(),
    getActivityTypes(),
    getBroadcast(),
  ]);
  return { activities, activityTypes, broadcast };
}
