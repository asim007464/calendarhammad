/**
 * One-off import: public/QSO_Dates_Cleaned.xlsx → activities table
 * Usage: node scripts/import-qso-dates-cleaned.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import XLSX from "xlsx";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

function loadEnv() {
  const path = resolve(root, ".env.local");
  if (!existsSync(path)) throw new Error(".env.local missing");
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 0) continue;
    const k = t.slice(0, i).trim();
    const v = t.slice(i + 1).trim();
    if (!process.env[k]) process.env[k] = v;
  }
}

const MONTHS = {
  Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6,
  Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12,
};

/** Rolling year starting August → Aug–Dec = Y, Jan–Jul = Y+1 */
function yearForMonth(monthNum, baseYear = 2026) {
  return monthNum >= 8 ? baseYear : baseYear + 1;
}

function parseUtcStamp(raw, baseYear = 2026) {
  const s = String(raw || "").trim();
  if (!s) return null;
  // "01 Aug 00:00" or "1 Aug 12:00"
  const m = s.match(/^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{1,2}):(\d{2})$/);
  if (!m) {
    const d = new Date(s);
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
  }
  const day = Number(m[1]);
  const month = MONTHS[m[2]];
  if (!month) return null;
  const hour = Number(m[3]);
  const minute = Number(m[4]);
  const year = yearForMonth(month, baseYear);
  return new Date(Date.UTC(year, month - 1, day, hour, minute, 0)).toISOString();
}

function splitList(value) {
  return String(value || "")
    .split(/[/;,|]+/)
    .map((x) => x.trim())
    .filter(Boolean);
}

function mapType(category) {
  const c = String(category || "").trim();
  return c || "Other";
}

loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("Supabase env missing");

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const xlsxPath = resolve(root, "public", "QSO_Dates_Cleaned.xlsx");
const wb = XLSX.readFile(xlsxPath);
const sheet = wb.Sheets["QSO Dates (Cleaned)"] || wb.Sheets[wb.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

console.log(`Read ${rows.length} rows from Excel`);

const activities = [];
let skipped = 0;
for (const row of rows) {
  const name = String(row.Activity || row.name || "").trim();
  const start_at = parseUtcStamp(row["Start (UTC)"] || row.start_at);
  const end_at = parseUtcStamp(row["End (UTC)"] || row.end_at);
  if (!name || !start_at) {
    skipped++;
    continue;
  }
  const modes = splitList(row.Mode || row.modes);
  const bands = splitList(row.Bands || row.bands);
  activities.push({
    name,
    type_name: mapType(row.Category || row.type_name),
    description: "",
    callsign: "",
    organizer: "",
    start_at,
    end_at,
    recurrence: "annual",
    bands,
    modes,
    frequencies: "",
    country: "",
    grid: "",
    website: "",
    notes: `Imported from QSO_Dates_Cleaned.xlsx · category: ${row.Category || ""}`.trim(),
    custom_fields: {
      source: "QSO_Dates_Cleaned",
      original_category: row.Category || "",
    },
    status: "published",
  });
}

console.log(`Prepared ${activities.length} activities (skipped ${skipped})`);

// Avoid duplicates for this import source (same name + start_at)
const { data: existing, error: existErr } = await supabase
  .from("activities")
  .select("name, start_at")
  .contains("custom_fields", { source: "QSO_Dates_Cleaned" });

if (existErr) {
  console.warn("Could not check existing imports:", existErr.message);
}

const existingKeys = new Set(
  (existing || []).map((a) => `${a.name}||${a.start_at}`)
);

const toInsert = activities.filter((a) => !existingKeys.has(`${a.name}||${a.start_at}`));
console.log(`New to insert: ${toInsert.length} (already imported: ${activities.length - toInsert.length})`);

const BATCH = 100;
let inserted = 0;
for (let i = 0; i < toInsert.length; i += BATCH) {
  const batch = toInsert.slice(i, i + BATCH);
  const { error } = await supabase.from("activities").insert(batch);
  if (error) {
    console.error(`Batch ${i / BATCH + 1} failed:`, error.message);
    process.exit(1);
  }
  inserted += batch.length;
  console.log(`Inserted ${inserted}/${toInsert.length}`);
}

console.log("Done.");
