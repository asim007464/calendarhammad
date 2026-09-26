import { apiRateLimitHeaders } from "@/lib/apiKey";
import { apiV1Json } from "@/lib/apiCors";
import { createAdminClient } from "@/lib/supabase/admin";
import { deleteActivityForUser, updateActivityForUser } from "@/lib/manageActivities";
import { formatActivityForApi, formatOwnedActivityForApi } from "@/lib/publicApi";
import { readJsonObject, requireApiUser } from "@/lib/v1Request";
import type { Activity } from "@/types/database";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiUser(request);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const admin = createAdminClient();
  const { data, error } = await admin.from("activities").select("*").eq("id", id).maybeSingle();

  if (error) {
    return apiV1Json({ error: error.message }, { status: 400, headers: apiRateLimitHeaders(auth.remaining) });
  }
  if (!data) {
    return apiV1Json({ error: "Activity not found." }, { status: 404, headers: apiRateLimitHeaders(auth.remaining) });
  }

  const owned = data.user_id === auth.userId;
  if (data.status !== "published" && !owned) {
    return apiV1Json({ error: "Activity not found." }, { status: 404, headers: apiRateLimitHeaders(auth.remaining) });
  }

  const activity = data as Activity;
  return apiV1Json(
    { activity: owned ? formatOwnedActivityForApi(activity) : formatActivityForApi(activity) },
    { headers: apiRateLimitHeaders(auth.remaining) }
  );
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiUser(request, { confirmed: true });
  if (!auth.ok) return auth.response;

  const raw = await readJsonObject(request);
  if (!raw) {
    return apiV1Json(
      { error: "Send a JSON object with the activity fields to update." },
      { status: 400, headers: apiRateLimitHeaders(auth.remaining) }
    );
  }

  const { id } = await params;
  const result = await updateActivityForUser(auth.userId, id, raw);
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
    { headers: apiRateLimitHeaders(auth.remaining) }
  );
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiUser(request, { confirmed: true });
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const result = await deleteActivityForUser(auth.userId, id);
  if (!result.ok) {
    return apiV1Json(
      { error: result.error },
      { status: result.statusCode, headers: apiRateLimitHeaders(auth.remaining) }
    );
  }

  return apiV1Json(
    { ok: true, id, message: result.message },
    { headers: apiRateLimitHeaders(auth.remaining) }
  );
}
