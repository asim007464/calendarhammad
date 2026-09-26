import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifySessionUser } from "@/lib/apiKey";
import { storeActivityImage } from "@/lib/activityUpload";

export async function POST(request: Request) {
  try {
    let userId: string | null = null;

    const bearerUser = await verifySessionUser(request);
    if (bearerUser) {
      userId = bearerUser.id;
    } else {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id ?? null;
    }

    if (!userId) {
      return NextResponse.json({ error: "You must be signed in to upload images." }, { status: 401 });
    }

    const form = await request.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No image file provided." }, { status: 400 });
    }

    const stored = await storeActivityImage(file);
    if (!stored.ok) {
      return NextResponse.json({ error: stored.error }, { status: stored.status });
    }

    return NextResponse.json({
      url: stored.url,
      path: stored.path,
    });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed." },
      { status: 500 }
    );
  }
}
