import type { Metadata } from "next";
import { ContactPageClient } from "@/components/ContactPageClient";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Contact QSO Dates | Ham Radio Support",
  description:
    "Contact QSODates.com for support, privacy requests, copyright complaints, legal notices, and API questions.",
  path: "/contact",
  keywords: ["ham radio support", "amateur radio contact"],
});

export default function ContactPage() {
  return <ContactPageClient />;
}
