import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatActivityForApi } from "@/lib/publicApi";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const format = (searchParams.get("format") ?? "json").toLowerCase();
  const type = searchParams.get("type");
  const country = searchParams.get("country");

  const admin = createAdminClient();
  let query = admin.from("activities").select("*").eq("status", "published").order("start_at");

  if (type) query = query.ilike("type_name", `%${type}%`);
  if (country) query = query.ilike("country", `%${country}%`);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const activities = (data ?? []).map(formatActivityForApi);

  if (format === "csv") {
    const headers = ["id", "name", "type", "callsign", "start_at", "end_at", "country", "bands", "website"];
    const rows = activities.map((a) =>
      headers.map((h) => {
        const val = a[h as keyof typeof a];
        const str = Array.isArray(val) ? val.join(";") : String(val ?? "");
        return `"${str.replace(/"/g, '""')}"`;
      }).join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n");
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="qsodates-activities.csv"',
      },
    });
  }

  return NextResponse.json({ activities, total: activities.length, license: "CC0, free to use with attribution" });
}
