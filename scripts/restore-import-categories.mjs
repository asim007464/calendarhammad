/**
 * Restore original Excel categories as type_name for imported events
 * so each category gets its own calendar color.
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

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

loadEnv();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const PAGE = 500;
let from = 0;
let updated = 0;

while (true) {
  const { data, error } = await supabase
    .from("activities")
    .select("id, type_name, custom_fields")
    .contains("custom_fields", { source: "QSO_Dates_Cleaned" })
    .range(from, from + PAGE - 1);

  if (error) {
    console.error(error.message);
    process.exit(1);
  }
  if (!data?.length) break;

  for (const row of data) {
    const original = row.custom_fields?.original_category;
    if (!original || original === row.type_name) continue;
    const { error: upErr } = await supabase
      .from("activities")
      .update({ type_name: original, updated_at: new Date().toISOString() })
      .eq("id", row.id);
    if (upErr) {
      console.error("update failed", row.id, upErr.message);
      process.exit(1);
    }
    updated++;
  }

  if (data.length < PAGE) break;
  from += PAGE;
}

console.log(`Updated type_name on ${updated} imported activities.`);
