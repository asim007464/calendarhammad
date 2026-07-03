import type { Metadata } from "next";
import Link from "next/link";
import BrandMark from "@/components/BrandMark";
import { WHATSAPP_DISPLAY, WHATSAPP_URL } from "@/lib/siteContact";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Contact QSO Dates | Ham Radio Support",
  description:
    "Contact QSO Dates for amateur radio calendar support via WhatsApp. Questions about ham radio contests, events, or publishing activities.",
  path: "/contact",
  keywords: ["ham radio support", "amateur radio contact"],
});

export default function ContactPage() {
  return (
    <div className="auth-page">
      <div className="auth-card panel" style={{ maxWidth: 480 }}>
        <div className="auth-header">
          <BrandMark link={false} size="auth" />
          <h1>Contact Us</h1>
          <p className="section-sub">Get in touch via WhatsApp — we respond as soon as we can.</p>
        </div>

        <div className="contact-whatsapp-card">
          <p className="contact-label">WhatsApp</p>
          <p className="contact-number no-cap">{WHATSAPP_DISPLAY}</p>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary contact-wa-btn"
          >
            Chat on WhatsApp
          </a>
        </div>

        <p className="auth-footer-link" style={{ marginTop: 24 }}>
          <Link href="/">← Back to calendar</Link>
        </p>
      </div>
    </div>
  );
}
