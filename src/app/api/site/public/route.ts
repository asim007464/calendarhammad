import { NextResponse } from "next/server";
import { getHomepageContent, getLockdownSettings } from "@/lib/siteSettings";

export async function GET() {
  const [lockdown, homepage] = await Promise.all([getLockdownSettings(), getHomepageContent()]);
  return NextResponse.json({ lockdown, homepage });
}
