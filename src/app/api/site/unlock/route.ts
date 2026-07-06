import { NextResponse } from "next/server";
import { verifySuperAdminSession } from "@/lib/adminAuth";
import { setLockdown } from "@/lib/siteSettings";

/** Emergency unlock using DEVELOPER_UNLOCK_SECRET — use if locked out of admin UI. */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const secret = String(body.secret ?? request.headers.get("x-developer-secret") ?? "");
  const expected = process.env.DEVELOPER_UNLOCK_SECRET;

  if (!expected || secret !== expected) {
    return NextResponse.json({ error: "Invalid unlock secret." }, { status: 403 });
  }

  await setLockdown(false, "");
  return NextResponse.json({ ok: true, message: "Site lockdown removed via developer secret." });
}

/** Super-admin bearer token unlock (from admin panel). */
export async function PATCH(request: Request) {
  const session = await verifySuperAdminSession(request);
  if (!session) {
    return NextResponse.json({ error: "Super-admin required." }, { status: 403 });
  }

  await setLockdown(false, "", session.profile.id);
  return NextResponse.json({ ok: true, message: "Site is live again." });
}
