import { generateMaskableAppIcon } from "@/lib/appIcon";

export const runtime = "nodejs";

export async function GET() {
  return generateMaskableAppIcon(512);
}
