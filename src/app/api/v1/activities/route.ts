import { apiRateLimitHeaders } from "@/lib/apiKey";
import { apiV1Json } from "@/lib/apiCors";
import { createActivityForUser } from "@/lib/manageActivities";
import {
  fetchPublicActivities,
  filterActivities,
  formatActivityForApi,
  formatOwnedActivityForApi,
  paginate,
} from "@/lib/publicApi";
import { readJsonObject, requireApiUser } from "@/lib/v1Request";

export async function POST(request: Request) {
  const auth = await requireApiUser(request, { confirmed: true });
  if (!auth.ok) return auth.response;

  const raw = await readJsonObject(request);
  if (!raw) {
    return apiV1Json(
      { error: "Send a JSON object with the activity fields." },
      { status: 400, headers: apiRateLimitHeaders(auth.remaining) }
    );
  }

  const result = await createActivityForUser(auth.userId, raw);
  if (!result.ok) {
    return apiV1Json(
      { error: result.error },
      { status: result.statusCode, headers: apiRateLimitHeaders(auth.remaining) }
    );
  }

  return apiV1Json(
    {
      activity: formatOwnedActivityForApi(result.activity),
      pendingApproval: result.pendingApproval,
      message: result.message,
    },
    { status: 201, headers: apiRateLimitHeaders(auth.remaining) }
  );
}

export async function GET(request: Request) {
  const auth = await requireApiUser(request);
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
