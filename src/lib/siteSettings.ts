import { createAdminClient } from "@/lib/supabase/admin";

export interface LockdownSettings {
  enabled: boolean;
  message: string;
  locked_at: string | null;
  locked_by: string | null;
}

export interface HomepageContent {
  eyebrow: string;
  title: string;
  lead: string;
  ctaPublish: string;
  ctaBrowse: string;
  ctaCalendar: string;
  statLive: string;
  statTotal: string;
  statApi: string;
  statUpcoming: string;
}

export const DEFAULT_HOMEPAGE: HomepageContent = {
  eyebrow: "Global Amateur Radio Events",
  title: "Your Worldwide Hub For Ham Radio On Air Activities",
  lead: "Browse contests, special event stations, POTA and SOTA activations, DXpeditions, nets, and field days. Publish your ham radio activity on QSO Dates.",
  ctaPublish: "Publish Your Activity",
  ctaBrowse: "Browse Events",
  ctaCalendar: "Open Calendar",
  statLive: "On Air Now",
  statTotal: "Total Activities",
  statApi: "Activities API",
  statUpcoming: "Upcoming",
};

export const DEFAULT_LOCKDOWN: LockdownSettings = {
  enabled: false,
  message: "QSO Dates is temporarily offline for maintenance. Please check back soon.",
  locked_at: null,
  locked_by: null,
};

async function readSetting<T>(key: string, fallback: T): Promise<T> {
  try {
    const admin = createAdminClient();
    const { data } = await admin.from("site_settings").select("value").eq("key", key).maybeSingle();
    if (!data?.value || typeof data.value !== "object") return fallback;
    return { ...fallback, ...(data.value as object) } as T;
  } catch {
    return fallback;
  }
}

async function writeSetting(key: string, value: object, userId?: string) {
  const admin = createAdminClient();
  const { error } = await admin.from("site_settings").upsert({
    key,
    value,
    updated_at: new Date().toISOString(),
    updated_by: userId ?? null,
  });
  if (error) throw error;
}

export async function getLockdownSettings(): Promise<LockdownSettings> {
  return readSetting("lockdown", DEFAULT_LOCKDOWN);
}

export async function setLockdown(enabled: boolean, message: string, userId?: string | null) {
  const current = await getLockdownSettings();
  await writeSetting(
    "lockdown",
    {
      ...current,
      enabled,
      message: message || DEFAULT_LOCKDOWN.message,
      locked_at: enabled ? new Date().toISOString() : null,
      locked_by: enabled ? userId ?? null : null,
    },
    userId ?? undefined
  );
}

export async function getHomepageContent(): Promise<HomepageContent> {
  return readSetting("homepage", DEFAULT_HOMEPAGE);
}

export async function setHomepageContent(content: HomepageContent, userId: string) {
  await writeSetting("homepage", content, userId);
}
