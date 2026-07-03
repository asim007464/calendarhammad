import { authenticateApiKey, apiRateLimitHeaders } from "@/lib/apiKey";
import { createAdminClient } from "@/lib/supabase/admin";
import { apiV1Json } from "@/lib/apiCors";

export async function GET(request: Request) {
  const auth = await authenticateApiKey(request);
  if (!auth.ok) return auth.response;

  const admin = createAdminClient();
  const { data, error } = await admin.from("activity_types").select("id, name, slug, color").order("name");

  if (error) {
    return apiV1Json({ error: error.message }, { status: 500 });
  }

  return apiV1Json(
    { activity_types: data ?? [] },
    { headers: apiRateLimitHeaders(auth.remaining) }
  );
}
