export function toUtcIso(value: unknown): string | null {
  if (value == null || value === "") return null;
  const s = String(value).trim();
  if (!s) return null;
  if (s.endsWith("Z") || /[+-]\d{2}:\d{2}$/.test(s)) {
    return new Date(s).toISOString();
  }
  return new Date(`${s}Z`).toISOString();
}

export function normalizeActivityBody(body: Record<string, unknown>) {
  const logo = body.logo_url;
  return {
    name: String(body.name || "").trim(),
    type_name: String(body.type_name || "Other").trim(),
    description: String(body.description || "").trim(),
    callsign: String(body.callsign || "").trim().toUpperCase(),
    organizer: String(body.organizer || "").trim(),
    start_at: toUtcIso(body.start_at),
    end_at: toUtcIso(body.end_at),
    recurrence: body.recurrence || "annual",
    bands: Array.isArray(body.bands) ? body.bands : [],
    modes: Array.isArray(body.modes) ? body.modes : [],
    frequencies: String(body.frequencies || "").trim(),
    country: String(body.country || "").trim(),
    grid: String(body.grid || "").trim().toUpperCase(),
    website: String(body.website || "").trim(),
    notes: String(body.notes || "").trim(),
    custom_fields: body.custom_fields && typeof body.custom_fields === "object" ? body.custom_fields : {},
    logo_url: logo && String(logo).trim() ? String(logo).trim() : null,
    image_url: body.image_url && String(body.image_url).trim() ? String(body.image_url).trim() : null,
  };
}
