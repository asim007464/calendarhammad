import type { Activity } from "@/types/database";
import { activityOnDay, parseDate, statusOf } from "@/lib/activity-utils";

const DEFAULT_LIMIT = 5;
const MIN_FILL = 3;

function rankActivity(a: Activity, today: Date, now: Date) {
  const status = statusOf(a, now);
  const onToday = activityOnDay(a, today);
  let score = 0;

  if (status === "live") score = 300;
  else if (onToday && status === "upcoming") score = 200;
  else if (onToday) score = 150;
  else if (status === "upcoming") score = 100;
  else return null;

  const start = parseDate(a.start_at)?.getTime() ?? Number.MAX_SAFE_INTEGER;
  return { activity: a, score, start };
}

// Live and today's events first, then nearest upcoming.
export function getFeaturedActivities(activities: Activity[], limit = DEFAULT_LIMIT): Activity[] {
  const now = new Date();
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  const ranked = activities
    .map((a) => rankActivity(a, today, now))
    .filter((row): row is NonNullable<typeof row> => row !== null)
    .sort((a, b) => (b.score !== a.score ? b.score - a.score : a.start - b.start));

  const picked = ranked.slice(0, limit).map((row) => row.activity);
  if (picked.length >= MIN_FILL) return picked;

  const seen = new Set(picked.map((a) => a.id));
  const fill = activities
    .filter((a) => statusOf(a, now) === "upcoming" && !seen.has(a.id))
    .sort(
      (a, b) =>
        (parseDate(a.start_at)?.getTime() ?? 0) - (parseDate(b.start_at)?.getTime() ?? 0),
    )
    .slice(0, limit - picked.length);

  return [...picked, ...fill].slice(0, limit);
}
