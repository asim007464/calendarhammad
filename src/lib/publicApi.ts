import { createAdminClient } from "@/lib/supabase/admin";
import type { Activity } from "@/types/database";

export async function fetchPublicActivities(): Promise<Activity[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("activities")
    .select("*")
    .eq("status", "published")
    .order("start_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as Activity[];
}

export interface ActivityFilters {
  type?: string | null;
  country?: string | null;
  band?: string | null;
}

export function filterActivities(rows: Activity[], filters: ActivityFilters): Activity[] {
  return rows.filter((row) => {
    if (filters.type && !row.type_name.toLowerCase().includes(filters.type.toLowerCase())) return false;
    if (filters.country && !(row.country ?? "").toLowerCase().includes(filters.country.toLowerCase())) return false;
    if (filters.band) {
      const bands = row.bands ?? [];
      if (!bands.some((b) => b.toLowerCase().includes(filters.band!.toLowerCase()))) return false;
    }
    return true;
  });
}

export function searchActivities(rows: Activity[], query: string): Activity[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return rows.filter((row) => {
    const haystack = [
      row.name,
      row.callsign,
      row.organizer,
      row.description,
      row.type_name,
      row.country,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}

export function filterByDateRange(rows: Activity[], from?: string | null, to?: string | null): Activity[] {
  return rows.filter((row) => {
    const start = new Date(row.start_at).getTime();
    if (from && start < new Date(from).getTime()) return false;
    if (to && start > new Date(to).getTime()) return false;
    return true;
  });
}

export function paginate<T>(items: T[], page: number, limit: number) {
  const p = Math.max(1, page || 1);
  const l = Math.min(200, Math.max(1, limit || 50));
  const start = (p - 1) * l;
  return {
    items: items.slice(start, start + l),
    total: items.length,
    page: p,
    limit: l,
  };
}

export function formatActivityForApi(row: Activity) {
  return {
    id: row.id,
    name: row.name,
    type: row.type_name,
    description: row.description ?? "",
    callsign: row.callsign ?? "",
    organizer: row.organizer ?? "",
    start_at: row.start_at,
    end_at: row.end_at ?? null,
    recurrence: row.recurrence,
    bands: row.bands ?? [],
    modes: row.modes ?? [],
    frequencies: row.frequencies ?? "",
    country: row.country ?? "",
    grid: row.grid ?? "",
    reference: row.reference ?? "",
    website: row.website ?? "",
    qrz: row.qrz ?? "",
    registration: row.registration ?? "",
    certificate: row.certificate ?? "",
    logo_url: row.logo_url ?? null,
    image_url: row.image_url ?? null,
    view_count: row.view_count ?? 0,
    click_count: row.click_count ?? 0,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}
