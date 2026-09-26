import { apiRateLimitHeaders, authenticateApiKey } from "@/lib/apiKey";
import { apiV1Json } from "@/lib/apiCors";
import { assertEmailConfirmed } from "@/lib/manageActivities";

export async function requireApiUser(request: Request, options?: { confirmed?: boolean }) {
  const auth = await authenticateApiKey(request);
  if (!auth.ok) return auth;

  if (options?.confirmed) {
    const confirmError = await assertEmailConfirmed(auth.userId);
    if (confirmError) {
      return {
        ok: false as const,
        response: apiV1Json(
          { error: confirmError },
          { status: 403, headers: apiRateLimitHeaders(auth.remaining) }
        ),
      };
    }
  }

  return auth;
}

export async function readJsonObject(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const body = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) return null;
    return body as Record<string, unknown>;
  } catch {
    return null;
  }
}
