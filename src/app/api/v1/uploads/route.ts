import { apiRateLimitHeaders } from "@/lib/apiKey";
import { apiV1Json } from "@/lib/apiCors";
import { storeActivityImage } from "@/lib/activityUpload";
import { requireApiUser } from "@/lib/v1Request";

export async function POST(request: Request) {
  const auth = await requireApiUser(request, { confirmed: true });
  if (!auth.ok) return auth.response;

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return apiV1Json(
      { error: "Send multipart form data with a file field." },
      { status: 400, headers: apiRateLimitHeaders(auth.remaining) }
    );
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return apiV1Json(
      { error: "No image file provided. Use the form field name file." },
      { status: 400, headers: apiRateLimitHeaders(auth.remaining) }
    );
  }

  const stored = await storeActivityImage(file);
  if (!stored.ok) {
    return apiV1Json(
      { error: stored.error },
      { status: stored.status, headers: apiRateLimitHeaders(auth.remaining) }
    );
  }

  return apiV1Json(
    { url: stored.url, path: stored.path },
    { status: 201, headers: apiRateLimitHeaders(auth.remaining) }
  );
}
