import { apiRateLimitHeaders } from "@/lib/apiKey";
import { apiV1Json } from "@/lib/apiCors";
import { DAILY_API_LIMIT } from "@/lib/apiConstants";
import { createAdminClient } from "@/lib/supabase/admin";
import { readJsonObject, requireApiUser } from "@/lib/v1Request";

const PROFILE_FIELDS = ["name", "callsign", "bio", "website", "qrz"] as const;

export async function GET(request: Request) {
  const auth = await requireApiUser(request);
  if (!auth.ok) return auth.response;

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("profiles")
    .select("id, name, callsign, email, bio, website, qrz, role")
    .eq("id", auth.userId)
    .maybeSingle();

  if (error || !data) {
    return apiV1Json(
      { error: error?.message || "Profile not found." },
      { status: error ? 500 : 404, headers: apiRateLimitHeaders(auth.remaining) }
    );
  }

  return apiV1Json(
    {
      profile: data,
      dailyLimit: DAILY_API_LIMIT,
      remainingToday: auth.remaining,
    },
    { headers: apiRateLimitHeaders(auth.remaining) }
  );
}

export async function PATCH(request: Request) {
  const auth = await requireApiUser(request, { confirmed: true });
  if (!auth.ok) return auth.response;

  const raw = await readJsonObject(request);
  if (!raw) {
    return apiV1Json(
      { error: "Send a JSON object with profile fields to update." },
      { status: 400, headers: apiRateLimitHeaders(auth.remaining) }
    );
  }

  const patch: Record<string, string> = {};
  for (const field of PROFILE_FIELDS) {
    if (raw[field] == null) continue;
    const value = String(raw[field]).trim().slice(0, field === "bio" ? 2000 : 300);
    patch[field] = field === "callsign" ? value.toUpperCase() : value;
  }

  if (!Object.keys(patch).length) {
    return apiV1Json(
      { error: "Include at least one of: name, callsign, bio, website, qrz." },
      { status: 400, headers: apiRateLimitHeaders(auth.remaining) }
    );
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("profiles")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", auth.userId)
    .select("id, name, callsign, email, bio, website, qrz, role")
    .single();

  if (error) {
    return apiV1Json({ error: error.message }, { status: 400, headers: apiRateLimitHeaders(auth.remaining) });
  }

  return apiV1Json(
    { profile: data, message: "Profile updated." },
    { headers: apiRateLimitHeaders(auth.remaining) }
  );
}
