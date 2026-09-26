import { API_V1_ENDPOINTS, DAILY_API_LIMIT } from "@/lib/apiConstants";
import { apiV1Json } from "@/lib/apiCors";
import { getSiteUrl } from "@/lib/siteUrl";

export async function GET() {
  return apiV1Json({
    name: "QSO Dates API",
    base_url: `${getSiteUrl()}/api/v1`,
    auth: "Register and verify your email, then copy the API key from /api-docs. Send it as the X-API-Key header, Authorization: Bearer qd_..., or the api_key query parameter.",
    rate_limit: {
      limit: DAILY_API_LIMIT,
      window: "1 day",
      resets: "midnight UTC",
    },
    cors: "Any website can call these routes and show the returned activity details.",
    endpoints: API_V1_ENDPOINTS.map((endpoint) => ({
      method: endpoint.method,
      path: endpoint.path,
      description: endpoint.desc,
    })),
  });
}
