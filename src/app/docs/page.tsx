import type { Metadata } from "next";
import { Topbar } from "@/components/Topbar";
import { Footer } from "@/components/Footer";
import { DocsPageClient } from "@/components/DocsPageClient";
import { DAILY_API_LIMIT, getApiBaseUrl } from "@/lib/apiConstants";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Ham Radio Events API Documentation | QSO Dates",
  description:
    "REST API documentation for the QSO Dates amateur radio activity calendar. Fetch ham radio contests, POTA, SOTA, and event data with your API key.",
  path: "/docs",
  keywords: ["ham radio API", "amateur radio REST API", "contest calendar API"],
});

export default function DocsPage() {
  return (
    <>
      <Topbar />
      <DocsPageClient baseUrl={getApiBaseUrl()} dailyLimit={DAILY_API_LIMIT} />
      <Footer />
    </>
  );
}
