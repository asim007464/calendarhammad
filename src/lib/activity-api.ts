const RECURRENCES = new Set(["none", "annual", "weekly", "monthly"]);

export function toUtcIso(value: unknown): string | null {
  if (value == null || value === "") return null;
  const s = String(value).trim();
  if (!s) return null;
  const parsed = s.endsWith("Z") || /[+-]\d{2}:\d{2}$/.test(s) ? new Date(s) : new Date(`${s}Z`);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}

function stringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => String(item).trim())
    .filter(Boolean)
    .slice(0, 40);
}

function stringMap(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const out: Record<string, string> = {};
  for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
    const name = key.trim().slice(0, 80);
    if (!name) continue;
    out[name] = String(val ?? "").slice(0, 500);
    if (Object.keys(out).length >= 30) break;
  }
  return out;
}

export function normalizeActivityBody(body: Record<string, unknown>) {
  const logo = body.logo_url;
  const recurrence = String(body.recurrence || "annual");
  return {
    name: String(body.name || "").trim().slice(0, 200),
    type_name: String(body.type_name || "Other").trim().slice(0, 80),
    description: String(body.description || "").trim().slice(0, 8000),
    callsign: String(body.callsign || "").trim().toUpperCase().slice(0, 32),
    organizer: String(body.organizer || "").trim().slice(0, 200),
    start_at: toUtcIso(body.start_at),
    end_at: toUtcIso(body.end_at),
    recurrence: RECURRENCES.has(recurrence) ? recurrence : "annual",
    bands: stringList(body.bands),
    modes: stringList(body.modes),
    frequencies: String(body.frequencies || "").trim().slice(0, 500),
    country: String(body.country || "").trim().slice(0, 120),
    grid: String(body.grid || "").trim().toUpperCase().slice(0, 16),
    reference: String(body.reference || "").trim().slice(0, 120),
    website: String(body.website || "").trim().slice(0, 500),
    email: String(body.email || "").trim().slice(0, 200),
    qrz: String(body.qrz || "").trim().slice(0, 500),
    registration: String(body.registration || "").trim().slice(0, 500),
    certificate: String(body.certificate || "").trim().slice(0, 500),
    award_details: String(body.award_details || "").trim().slice(0, 2000),
    notes: String(body.notes || "").trim().slice(0, 4000),
    custom_fields: stringMap(body.custom_fields),
    logo_url: logo && String(logo).trim() ? String(logo).trim().slice(0, 1000) : null,
    image_url: body.image_url && String(body.image_url).trim() ? String(body.image_url).trim().slice(0, 1000) : null,
  };
}

/** Overlay only the fields the caller sent, so a partial API update does not wipe the rest. */
export function mergeActivityBody(existing: Record<string, unknown>, raw: Record<string, unknown>) {
  return normalizeActivityBody({ ...existing, ...raw });
}
