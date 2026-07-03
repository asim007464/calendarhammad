import { authenticateApiKey, apiRateLimitHeaders } from "@/lib/apiKey";
import {
  fetchPublicActivities,
  formatActivityForApi,
  paginate,
  searchActivities,
} from "@/lib/publicApi";
import { apiV1Json } from "@/lib/apiCors";

export async function GET(request: Request) {
  const auth = await authenticateApiKey(request);
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const page = Number(searchParams.get("page") ?? "1");
  const limit = Number(searchParams.get("limit") ?? "50");

  if (!q) {
    return apiV1Json({ error: "Query parameter q is required." }, { status: 400 });
  }

  const rows = await fetchPublicActivities();
  const filtered = searchActivities(rows, q);
  const { items, total, page: p, limit: l } = paginate(filtered, page, limit);

  return apiV1Json(
    { activities: items.map(formatActivityForApi), total, page: p, limit: l, query: q },
    { headers: apiRateLimitHeaders(auth.remaining) }
  );
}
