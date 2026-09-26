import { createAdminClient } from "@/lib/supabase/admin";
import { mergeActivityBody, normalizeActivityBody } from "@/lib/activity-api";
import { isAdminEmail } from "@/lib/admin";
import { notifyAdminEmail, sendAdminActivityNotificationEmail } from "@/lib/mail";
import { getSiteUrl } from "@/lib/siteUrl";
import type { Activity } from "@/types/database";

const RECURRENCES = new Set(["none", "annual", "weekly", "monthly"]);
const STATUSES = new Set(["pending_review", "published", "rejected"]);

export type ActivityActionResult =
  | {
      ok: true;
      activity: Activity;
      statusCode: number;
      pendingApproval: boolean;
      message: string;
    }
  | { ok: false; error: string; statusCode: number };

async function loadActor(userId: string) {
  const admin = createAdminClient();
  const [{ data: profile }, authUser] = await Promise.all([
    admin.from("profiles").select("role, email, name, callsign, is_blocked").eq("id", userId).maybeSingle(),
    admin.auth.admin.getUserById(userId),
  ]);

  if (profile?.is_blocked) return { blocked: true as const, profile: null, isAdmin: false, admin };

  const email = profile?.email || authUser.data.user?.email || "";
  const isAdmin = isAdminEmail(email) || isAdminEmail(authUser.data.user?.email) || profile?.role === "admin";
  return {
    blocked: false as const,
    profile: profile ? { ...profile, email: email || profile.email } : profile,
    isAdmin,
    admin,
  };
}

function validateSchedule(body: ReturnType<typeof normalizeActivityBody>, raw: Record<string, unknown>) {
  if (!body.name) return "Activity name is required.";
  if (!body.start_at) return "Start date/time is required. Use an ISO time such as 2026-10-24T00:00:00Z.";
  if (body.end_at && body.start_at && new Date(body.end_at).getTime() < new Date(body.start_at).getTime()) {
    return "End time must be the same as or after the start time.";
  }
  if (raw.recurrence != null && raw.recurrence !== "" && !RECURRENCES.has(String(raw.recurrence))) {
    return "Recurrence must be none, annual, weekly, or monthly.";
  }
  return null;
}

export async function assertEmailConfirmed(userId: string): Promise<string | null> {
  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.getUserById(userId);
  if (error || !data.user?.email_confirmed_at) {
    return "Verify your email before using the API. Register, confirm the code from your inbox, then use the API key from your account.";
  }
  return null;
}

export async function createActivityForUser(
  userId: string,
  raw: Record<string, unknown>
): Promise<ActivityActionResult> {
  const body = normalizeActivityBody(raw);
  const invalid = validateSchedule(body, raw);
  if (invalid) return { ok: false, error: invalid, statusCode: 400 };

  const actor = await loadActor(userId);
  if (actor.blocked) return { ok: false, error: "Account is blocked.", statusCode: 403 };

  const status = actor.isAdmin ? "published" : "pending_review";
  const { data, error } = await actor.admin
    .from("activities")
    .insert({
      ...body,
      user_id: userId,
      status,
    })
    .select()
    .single();

  if (error) return { ok: false, error: error.message, statusCode: 400 };

  await actor.admin.from("activity_logs").insert({
    activity_id: data.id,
    user_id: userId,
    event_type: "social_post",
    metadata: { action: "created", status },
  });

  await notifyAdminEmail((to) =>
    sendAdminActivityNotificationEmail({
      to,
      activityId: data.id,
      activityName: data.name,
      activityType: data.type_name || "Other",
      submitterName: actor.profile?.name || actor.profile?.email?.split("@")[0] || "User",
      submitterEmail: actor.profile?.email || "",
      callsign: data.callsign || actor.profile?.callsign || undefined,
      status: status as "published" | "pending_review",
      startAt: data.start_at,
      country: data.country || undefined,
    })
  );

  if (status === "published") {
    fetch(`${getSiteUrl()}/api/social/post`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activity_id: data.id }),
    }).catch(() => {});
  }

  return {
    ok: true,
    activity: data as Activity,
    statusCode: 201,
    pendingApproval: status === "pending_review",
    message:
      status === "pending_review"
        ? "Activity submitted for admin approval. It will appear on the site once approved."
        : "Activity published.",
  };
}

export async function updateActivityForUser(
  userId: string,
  activityId: string,
  raw: Record<string, unknown>
): Promise<ActivityActionResult> {
  const actor = await loadActor(userId);
  if (actor.blocked) return { ok: false, error: "Account is blocked.", statusCode: 403 };

  const { data: existing, error: fetchError } = await actor.admin
    .from("activities")
    .select("*")
    .eq("id", activityId)
    .maybeSingle();

  if (fetchError) return { ok: false, error: fetchError.message, statusCode: 400 };
  if (!existing) return { ok: false, error: "Activity not found.", statusCode: 404 };
  if (!actor.isAdmin && existing.user_id !== userId) {
    return { ok: false, error: "You can only edit your own activities.", statusCode: 403 };
  }

  const body = mergeActivityBody(existing as Record<string, unknown>, raw);
  const invalid = validateSchedule(body, { ...existing, ...raw });
  if (invalid) return { ok: false, error: invalid, statusCode: 400 };

  const updatePayload: Record<string, unknown> = {
    ...body,
    updated_at: new Date().toISOString(),
  };

  if (actor.isAdmin && typeof raw.status === "string" && STATUSES.has(raw.status.trim())) {
    updatePayload.status = raw.status.trim();
  }

  const { data, error } = await actor.admin
    .from("activities")
    .update(updatePayload)
    .eq("id", activityId)
    .select()
    .single();

  if (error) return { ok: false, error: error.message, statusCode: 400 };

  return {
    ok: true,
    activity: data as Activity,
    statusCode: 200,
    pendingApproval: data.status === "pending_review",
    message: "Activity updated.",
  };
}

export async function deleteActivityForUser(userId: string, activityId: string): Promise<ActivityActionResult> {
  const actor = await loadActor(userId);
  if (actor.blocked) return { ok: false, error: "Account is blocked.", statusCode: 403 };

  const { data: existing, error: fetchError } = await actor.admin
    .from("activities")
    .select("id, user_id, name, status")
    .eq("id", activityId)
    .maybeSingle();

  if (fetchError) return { ok: false, error: fetchError.message, statusCode: 400 };
  if (!existing) return { ok: false, error: "Activity not found.", statusCode: 404 };
  if (!actor.isAdmin && existing.user_id !== userId) {
    return { ok: false, error: "You can only delete your own activities.", statusCode: 403 };
  }

  const { error } = await actor.admin.from("activities").delete().eq("id", activityId);
  if (error) return { ok: false, error: error.message, statusCode: 400 };

  return {
    ok: true,
    activity: existing as Activity,
    statusCode: 200,
    pendingApproval: false,
    message: "Activity deleted.",
  };
}
