import type { Activity, RecurrenceType } from "@/types/database";

export function parseDate(s?: string | null): Date | null {
  return s ? new Date(s) : null;
}

export function colorFor(type: string, colors?: Record<string, string>): string {
  return colors?.[type] || "#64748b";
}

export function isRecurring(r: RecurrenceType): boolean {
  return r !== "none";
}

export function occurrenceRange(a: Activity, year: number) {
  const start = parseDate(a.start_at);
  const end = parseDate(a.end_at) || start;
  if (!start) return { start: null, end: null };

  if (a.recurrence === "annual") {
    const e = end || start;
    return {
      start: new Date(Date.UTC(year, start.getUTCMonth(), start.getUTCDate(), start.getUTCHours(), start.getUTCMinutes())),
      end: new Date(Date.UTC(year, e.getUTCMonth(), e.getUTCDate(), e.getUTCHours(), e.getUTCMinutes())),
    };
  }
  return { start, end: end || start };
}

export function activityOnDay(a: Activity, day: Date): boolean {
  const y = day.getUTCFullYear();
  const m = day.getUTCMonth();
  const d = day.getUTCDate();

  const start = parseDate(a.start_at);
  const end = parseDate(a.end_at) || start;
  if (!start) return false;

  if (a.recurrence === "annual") {
    const sm = start.getUTCMonth();
    const sd = start.getUTCDate();
    const em = (end || start).getUTCMonth();
    const ed = (end || start).getUTCDate();
    const target = m * 100 + d;
    const sVal = sm * 100 + sd;
    const eVal = em * 100 + ed;
    if (sVal <= eVal) return target >= sVal && target <= eVal;
    return target >= sVal || target <= eVal;
  }

  if (a.recurrence === "weekly") {
    const diff = Math.floor((day.getTime() - start.getTime()) / 86400000);
    if (diff < 0) return false;
    return diff % 7 === 0;
  }

  if (a.recurrence === "monthly") {
    return d === start.getUTCDate();
  }

  const dayStart = Date.UTC(y, m, d);
  const dayEnd = Date.UTC(y, m, d, 23, 59, 59);
  const actStart = start.getTime();
  const actEnd = (end || start).getTime();
  return actStart <= dayEnd && actEnd >= dayStart;
}

export function statusOf(a: Activity, now = new Date()): "live" | "upcoming" | "past" {
  const start = parseDate(a.start_at);
  const end = parseDate(a.end_at) || start;
  if (!start || !end) return "past";

  if (a.recurrence === "annual") {
    const year = now.getUTCFullYear();
    const occ = occurrenceRange(a, year);
    if (occ.start && occ.end) {
      if (now >= occ.start && now <= occ.end) return "live";
      if (now < occ.start) return "upcoming";
    }
    const next = occurrenceRange(a, year + 1);
    if (next.start && now < next.start) return "upcoming";
    return "past";
  }

  if (now > end) return "past";
  if (now >= start && now <= end) return "live";
  return "upcoming";
}

export function fmtUTC(s?: string | null): string {
  const d = parseDate(s);
  if (!d) return "—";
  return (
    d.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC",
    }) + " UTC"
  );
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
