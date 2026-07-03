import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Ham Radio API Portal | QSO Dates",
  description:
    "Get your personal API key for the QSO Dates amateur radio activity calendar. Integrate ham radio contest and event data into your apps.",
  path: "/api-docs",
  keywords: ["ham radio API key", "amateur radio developer API"],
});

export default function ApiDocsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
