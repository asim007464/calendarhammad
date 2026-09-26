import { apiRateLimitHeaders } from "@/lib/apiKey";
import { slugify } from "@/lib/activity-utils";
import { createAdminClient } from "@/lib/supabase/admin";
import { apiV1Json } from "@/lib/apiCors";
import { readJsonObject, requireApiUser } from "@/lib/v1Request";

export async function POST(request: Request) {
  const auth = await requireApiUser(request, { confirmed: true });
  if (!auth.ok) return auth.response;

  const raw = await readJsonObject(request);
  const name = String(raw?.name ?? "").trim().slice(0, 80);
  if (!name) {
    return apiV1Json(
      { error: "Activity type name is required." },
      { status: 400, headers: apiRateLimitHeaders(auth.remaining) }
    );
  }

  const color = String(raw?.color ?? "#64748b").trim().slice(0, 32) || "#64748b";
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("activity_types")
    .insert({
      name,
      slug: slugify(name),
      color,
      created_by: auth.userId,
    })
    .select("id, name, slug, color")
    .single();

  if (error) {
    const duplicate = error.code === "23505" || /duplicate|unique/i.test(error.message);
    return apiV1Json(
      { error: duplicate ? "That activity type already exists." : error.message },
      { status: duplicate ? 409 : 400, headers: apiRateLimitHeaders(auth.remaining) }
    );
  }

  return apiV1Json(
    { activity_type: data },
    { status: 201, headers: apiRateLimitHeaders(auth.remaining) }
  );
}

export async function GET(request: Request) {
  const auth = await requireApiUser(request);
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
