import { authenticateApiKey, apiRateLimitHeaders } from "@/lib/apiKey";
import {
  fetchPublicActivities,
  filterByDateRange,
  formatActivityForApi,
  paginate,
} from "@/lib/publicApi";
import { apiV1Json } from "@/lib/apiCors";

export async function GET(request: Request) {
  const auth = await authenticateApiKey(request);
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const page = Number(searchParams.get("page") ?? "1");
  const limit = Number(searchParams.get("limit") ?? "50");

  const rows = await fetchPublicActivities();
  const filtered = filterByDateRange(rows, from, to);
  const { items, total, page: p, limit: l } = paginate(filtered, page, limit);

  return apiV1Json(
    { activities: items.map(formatActivityForApi), total, page: p, limit: l },
    { headers: apiRateLimitHeaders(auth.remaining) }
  );
}
