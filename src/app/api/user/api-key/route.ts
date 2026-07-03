import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { DAILY_API_LIMIT, getApiBaseUrl } from "@/lib/apiConstants";
import { ensureUserApiKey, verifySessionUser } from "@/lib/apiKey";

export async function GET(request: Request) {
  const user = await verifySessionUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const apiKey = await ensureUserApiKey(user.id);
    const admin = createAdminClient();
    const { data: usage } = await admin
      .from("profiles")
      .select("api_requests_today, api_requests_date")
      .eq("id", user.id)
      .maybeSingle();

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
