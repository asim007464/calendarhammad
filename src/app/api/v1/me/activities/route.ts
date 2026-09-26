import { apiRateLimitHeaders } from "@/lib/apiKey";
import { apiV1Json } from "@/lib/apiCors";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatOwnedActivityForApi, paginate } from "@/lib/publicApi";
import { requireApiUser } from "@/lib/v1Request";
import type { Activity } from "@/types/database";

export async function GET(request: Request) {
  const auth = await requireApiUser(request);
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") ?? "1");
  const limit = Number(searchParams.get("limit") ?? "50");
  const status = searchParams.get("status");

  const admin = createAdminClient();
  let query = admin.from("activities").select("*").eq("user_id", auth.userId).order("start_at", { ascending: true });
  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) {
    return apiV1Json({ error: error.message }, { status: 500, headers: apiRateLimitHeaders(auth.remaining) });
  }

  const rows = (data ?? []) as Activity[];
  const { items, total, page: p, limit: l } = paginate(rows, page, limit);

  return apiV1Json(
    {
      activities: items.map(formatOwnedActivityForApi),
      total,
      page: p,
      limit: l,
    },
    { headers: apiRateLimitHeaders(auth.remaining) }
  );
}
