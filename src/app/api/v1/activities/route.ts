import { authenticateApiKey, apiRateLimitHeaders } from "@/lib/apiKey";
import {
  fetchPublicActivities,
  filterActivities,
  formatActivityForApi,
  paginate,
} from "@/lib/publicApi";
import { apiV1Json } from "@/lib/apiCors";

export async function GET(request: Request) {
  const auth = await authenticateApiKey(request);
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") ?? "1");
  const limit = Number(searchParams.get("limit") ?? "50");

  const rows = await fetchPublicActivities();
  const filtered = filterActivities(rows, {
    type: searchParams.get("type"),
    country: searchParams.get("country"),
    band: searchParams.get("band"),
  });

  const { items, total, page: p, limit: l } = paginate(filtered, page, limit);

  return apiV1Json(
    {
      activities: items.map(formatActivityForApi),
      total,
      page: p,
      limit: l,
    },
    { headers: apiRateLimitHeaders(auth.remaining) }
  );
}
