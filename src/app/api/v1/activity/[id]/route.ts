import { authenticateApiKey, apiRateLimitHeaders } from "@/lib/apiKey";
import { fetchPublicActivities, formatActivityForApi } from "@/lib/publicApi";
import { apiV1Json } from "@/lib/apiCors";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authenticateApiKey(request);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const rows = await fetchPublicActivities();
  const activity = rows.find((r) => r.id === id);

  if (!activity) {
    return apiV1Json({ error: "Activity not found." }, { status: 404 });
  }

  return apiV1Json(
    { activity: formatActivityForApi(activity) },
    { headers: apiRateLimitHeaders(auth.remaining) }
  );
}
