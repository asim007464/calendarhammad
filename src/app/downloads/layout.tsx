import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Download Ham Radio Events | QSO Dates",
  description:
    "Export amateur radio activities as JSON or CSV: ham radio contests, POTA, SOTA, DXpeditions, and special events. Free bulk download, no API key required.",
  path: "/downloads",
  keywords: ["ham radio data export", "amateur radio CSV download"],
});

export default function DownloadsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
