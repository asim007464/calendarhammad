import { NextResponse } from "next/server";
import { verifyAdminSession, verifySuperAdminSession } from "@/lib/adminAuth";
import { getLockdownSettings, setLockdown } from "@/lib/siteSettings";

export async function GET(request: Request) {
  const session = await verifyAdminSession(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const lockdown = await getLockdownSettings();
  return NextResponse.json(lockdown);
}

export async function POST(request: Request) {
  const session = await verifyAdminSession(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const enabled = Boolean(body.enabled);
  const message = String(body.message ?? "").trim();

  await setLockdown(enabled, message, session.profile.id);
  return NextResponse.json({ ok: true, enabled });
}

export async function DELETE(request: Request) {
  const session = await verifySuperAdminSession(request);
  if (!session) {
    return NextResponse.json(
      { error: "Only the developer super-admin can unlock the site." },
      { status: 403 }
    );
  }

  await setLockdown(false, "", session.profile.id);
  return NextResponse.json({ ok: true, message: "Site lockdown lifted." });
}
