import { NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/adminAuth";
import { getHomepageContent, setHomepageContent, type HomepageContent } from "@/lib/siteSettings";

export async function GET(request: Request) {
  const session = await verifyAdminSession(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const homepage = await getHomepageContent();
  return NextResponse.json(homepage);
}

export async function PATCH(request: Request) {
  const session = await verifyAdminSession(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const current = await getHomepageContent();
  const next: HomepageContent = {
    eyebrow: String(body.eyebrow ?? current.eyebrow),
    title: String(body.title ?? current.title),
    lead: String(body.lead ?? current.lead),
    ctaPublish: String(body.ctaPublish ?? current.ctaPublish),
    ctaBrowse: String(body.ctaBrowse ?? current.ctaBrowse),
    ctaCalendar: String(body.ctaCalendar ?? current.ctaCalendar),
    statLive: String(body.statLive ?? current.statLive),
    statTotal: String(body.statTotal ?? current.statTotal),
    statApi: String(body.statApi ?? current.statApi),
    statUpcoming: String(body.statUpcoming ?? current.statUpcoming),
  };

  await setHomepageContent(next, session.profile.id);
  return NextResponse.json({ ok: true, homepage: next });
}
