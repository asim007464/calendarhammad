import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { DAILY_API_LIMIT } from "@/lib/apiConstants";
import { apiV1Json, mergeApiV1CorsHeaders } from "@/lib/apiCors";

export function generateApiKey(): string {
  return `qd_${crypto.randomBytes(24).toString("hex")}`;
}

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

export function extractApiKey(request: Request): string | null {
  const headerKey = request.headers.get("x-api-key")?.trim();
  if (headerKey) return headerKey;

  const auth = request.headers.get("authorization")?.trim();
  if (auth?.toLowerCase().startsWith("bearer ")) {
    const token = auth.slice(7).trim();
    if (token.startsWith("qd_")) return token;
  }

  const { searchParams } = new URL(request.url);
  const queryKey = searchParams.get("api_key")?.trim() || searchParams.get("key")?.trim();
  if (queryKey?.startsWith("qd_")) return queryKey;

  return null;
}

function isMissingApiKeyColumnError(error: { code?: string; message?: string }): boolean {
  return error.code === "42703" || (error.message?.includes("api_key") ?? false);
}

export async function ensureUserApiKey(userId: string): Promise<string> {
  const admin = createAdminClient();
  const { data: row, error: selectError } = await admin
    .from("profiles")
    .select("api_key")
    .eq("id", userId)
    .maybeSingle();

  if (selectError) {
    if (isMissingApiKeyColumnError(selectError)) {
      throw new Error("API database setup required. Run supabase/migrations/003_api_keys.sql in Supabase.");
    }
    throw selectError;
  }

  if (row?.api_key) return row.api_key;

  const apiKey = generateApiKey();
  const { error: updateError } = await admin.from("profiles").update({ api_key: apiKey }).eq("id", userId);

  if (updateError) {
    if (isMissingApiKeyColumnError(updateError)) {
      throw new Error("API database setup required. Run supabase/migrations/003_api_keys.sql in Supabase.");
    }
    throw updateError;
  }

  return apiKey;
}

async function getBearerUser(request: Request): Promise<User | null> {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token || token.startsWith("qd_")) return null;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user?.email) return null;
  return user;
}

export async function verifySessionUser(request: Request): Promise<User | null> {
  const user = await getBearerUser(request);
  if (!user) return null;

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("is_blocked")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.is_blocked) return null;
  return user;
}

export type ApiKeyAuthResult =
  | { ok: true; userId: string; remaining: number }
  | { ok: false; response: ReturnType<typeof apiV1Json> };

export async function authenticateApiKey(request: Request): Promise<ApiKeyAuthResult> {
  const apiKey = extractApiKey(request);
  if (!apiKey) {
    return {
      ok: false,
      response: apiV1Json(
        {
          error:
            "API key required. Add ?api_key=qd_your_key to the URL, or pass X-API-Key / Authorization: Bearer header.",
        },
        { status: 401 }
      ),
    };
  }

  const admin = createAdminClient();
  const { data: user, error } = await admin
    .from("profiles")
    .select("id, api_requests_today, api_requests_date, is_blocked")
    .eq("api_key", apiKey)
    .maybeSingle();

  if (error) {
    if (isMissingApiKeyColumnError(error)) {
      return {
        ok: false,
        response: apiV1Json(
          { error: "API database setup required. Run 003_api_keys.sql in Supabase.", code: "MIGRATION_REQUIRED" },
          { status: 503 }
        ),
      };
    }
    return { ok: false, response: apiV1Json({ error: "Invalid API key." }, { status: 401 }) };
  }

  if (!user) {
    return { ok: false, response: apiV1Json({ error: "Invalid API key." }, { status: 401 }) };
  }

  if (user.is_blocked) {
    return { ok: false, response: apiV1Json({ error: "Account is blocked." }, { status: 403 }) };
  }

  const today = todayUtc();
  let count = user.api_requests_today ?? 0;
  let date = user.api_requests_date;

  if (date !== today) {
    count = 0;
    date = today;
  }

  if (count >= DAILY_API_LIMIT) {
    return {
      ok: false,
      response: apiV1Json(
        { error: "Daily API limit reached.", limit: DAILY_API_LIMIT, resets: "midnight UTC" },
        { status: 429 }
      ),
    };
  }

  const nextCount = count + 1;
  await admin
    .from("profiles")
    .update({ api_requests_today: nextCount, api_requests_date: today })
    .eq("id", user.id);

  return { ok: true, userId: user.id, remaining: DAILY_API_LIMIT - nextCount };
}

export function apiRateLimitHeaders(remaining: number): Record<string, string> {
  return mergeApiV1CorsHeaders({
    "X-RateLimit-Limit": String(DAILY_API_LIMIT),
    "X-RateLimit-Remaining": String(Math.max(0, remaining)),
    "X-RateLimit-Reset": "midnight UTC",
  });
}
