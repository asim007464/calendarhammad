import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { DAILY_API_LIMIT, getApiBaseUrl } from "@/lib/apiConstants";
import { ensureUserApiKey, verifySessionUser } from "@/lib/apiKey";

async function resolveUserId(request: Request): Promise<string | null> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const admin = createAdminClient();
      const { data: profile } = await admin
        .from("profiles")
        .select("is_blocked")
        .eq("id", user.id)
        .maybeSingle();
      if (!profile?.is_blocked) return user.id;
    }
  } catch (err) {
    console.error("API key cookie auth error:", err);
  }

  const bearerUser = await verifySessionUser(request);
  return bearerUser?.id ?? null;
}

export async function GET(request: Request) {
  const userId = await resolveUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const apiKey = await ensureUserApiKey(userId);
    const admin = createAdminClient();
    const { data: usage, error: usageError } = await admin
      .from("profiles")
      .select("api_requests_today, api_requests_date")
      .eq("id", userId)
      .maybeSingle();

    if (usageError && !usageError.message?.includes("api_requests")) {
      console.error("API usage fetch error:", usageError);
    }

    const today = new Date().toISOString().slice(0, 10);
    const usedToday = usage?.api_requests_date === today ? (usage.api_requests_today ?? 0) : 0;

    return NextResponse.json({
      apiKey,
      baseUrl: getApiBaseUrl(),
      dailyLimit: DAILY_API_LIMIT,
      usedToday,
      remainingToday: Math.max(0, DAILY_API_LIMIT - usedToday),
    });
  } catch (err) {
    console.error("API key fetch error:", err);
    const message = err instanceof Error ? err.message : "Could not load API key.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
