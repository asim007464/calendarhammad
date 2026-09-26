import { apiRateLimitHeaders } from "@/lib/apiKey";
import { apiV1Json } from "@/lib/apiCors";
import { notifyAdminEmail, sendAdminSupportNotificationEmail } from "@/lib/mail";
import { createAdminClient } from "@/lib/supabase/admin";
import { readJsonObject, requireApiUser } from "@/lib/v1Request";

export async function GET(request: Request) {
  const auth = await requireApiUser(request);
  if (!auth.ok) return auth.response;

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("support_messages")
    .select("id, subject, message, status, reply, created_at")
    .eq("user_id", auth.userId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return apiV1Json({ error: error.message }, { status: 500, headers: apiRateLimitHeaders(auth.remaining) });
  }

  return apiV1Json(
    { messages: data ?? [] },
    { headers: apiRateLimitHeaders(auth.remaining) }
  );
}

export async function POST(request: Request) {
  const auth = await requireApiUser(request, { confirmed: true });
  if (!auth.ok) return auth.response;

  const raw = await readJsonObject(request);
  if (!raw) {
    return apiV1Json(
      { error: "Send a JSON object with subject and message." },
      { status: 400, headers: apiRateLimitHeaders(auth.remaining) }
    );
  }

  const subject = String(raw.subject ?? "").trim().slice(0, 200);
  const message = String(raw.message ?? "").trim().slice(0, 5000);
  if (!subject || !message) {
    return apiV1Json(
      { error: "Subject and message are required." },
      { status: 400, headers: apiRateLimitHeaders(auth.remaining) }
    );
  }

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("name, callsign, email")
    .eq("id", auth.userId)
    .maybeSingle();

  const { data, error } = await admin
    .from("support_messages")
    .insert({
      user_id: auth.userId,
      user_name: String(raw.user_name ?? profile?.name ?? "").trim().slice(0, 120) || "Member",
      callsign: String(raw.callsign ?? profile?.callsign ?? "").trim().slice(0, 32),
      email: String(raw.email ?? profile?.email ?? "").trim().slice(0, 200),
      subject,
      message,
      status: "open",
    })
    .select("id, subject, message, status, created_at")
    .single();

  if (error) {
    return apiV1Json({ error: error.message }, { status: 500, headers: apiRateLimitHeaders(auth.remaining) });
  }

  await notifyAdminEmail((to) =>
    sendAdminSupportNotificationEmail({
      to,
      userName: String(raw.user_name ?? profile?.name ?? "Member"),
      email: String(raw.email ?? profile?.email ?? ""),
      subject,
      message,
    })
  );

  return apiV1Json(
    { message: data, notice: "Support message sent." },
    { status: 201, headers: apiRateLimitHeaders(auth.remaining) }
  );
}
