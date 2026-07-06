/** Format UTC instant as YYYY-MM-DDTHH:mm for activity forms. */
export function isoToUtcPickerValue(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}T${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
}

export function utcPickerValueToDisplay(value: string): string {
  if (!value) return "Select date and time";
  const [datePart, timePart] = value.split("T");
  if (!datePart || !timePart) return "Select date and time";
  const [y, m, d] = datePart.split("-").map(Number);
  const [h, min] = timePart.split(":").map(Number);
  if (!y || !m || !d) return "Select date and time";
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[m - 1]} ${d}, ${y} · ${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")} UTC`;
}

export function parseUtcPickerValue(value: string): { y: number; m: number; d: number; h: number; min: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;
  const y = Number(match[1]);
  const m = Number(match[2]) - 1;
  const d = Number(match[3]);
  const h = Number(match[4]);
  const min = Number(match[5]);
  if (m < 0 || m > 11 || d < 1 || d > 31 || h > 23 || min > 59) return null;
  return { y, m, d, h, min };
}

export function buildUtcPickerValue(parts: { y: number; m: number; d: number; h: number; min: number }): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${parts.y}-${pad(parts.m + 1)}-${pad(parts.d)}T${pad(parts.h)}:${pad(parts.min)}`;
}

export function defaultUtcPickerValue(): string {
  const now = new Date();
  return buildUtcPickerValue({
    y: now.getUTCFullYear(),
    m: now.getUTCMonth(),
    d: now.getUTCDate(),
    h: 12,
    min: 0,
  });
}
