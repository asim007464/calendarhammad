import type { Metadata } from "next";
import Link from "next/link";
import BrandMark from "@/components/BrandMark";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { WHATSAPP_URL } from "@/lib/siteContact";
import { LEGAL_NAV } from "@/lib/legalNav";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Contact QSO Dates | Ham Radio Support",
  description:
    "Contact QSODates.com for support, privacy requests, copyright complaints, legal notices, and API questions.",
  path: "/contact",
  keywords: ["ham radio support", "amateur radio contact"],
});

const CONTACT_TOPICS = [
  "General Support",
  "Privacy Requests",
  "Copyright Complaints",
  "Legal Notices",
  "API Questions",
];

export default function ContactPage() {
  return (
    <div className="legal-page">
      <div className="legal-inner">
        <header className="legal-header">
          <Link href="/">
            <BrandMark link={false} size="auth" />
          </Link>
          <h1>Contact</h1>
          <p className="section-sub">
            Please use this page for general support, privacy requests, copyright complaints, legal notices,
            and API questions.
          </p>
        </header>

        <nav className="legal-nav panel" aria-label="Legal pages">
          {LEGAL_NAV.map((item) => (
            <Link key={item.href} href={item.href} className={item.href === "/contact" ? "active" : undefined}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="legal-content panel">
          <h2>Get In Touch</h2>
          <p>The fastest way to reach the QSODates.com team is via WhatsApp. We respond as soon as we can.</p>

          <div className="contact-whatsapp-card">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="contact-wa-logo"
              aria-label="Chat on WhatsApp"
            >
              <WhatsAppIcon size={48} />
            </a>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary contact-wa-btn"
            >
              Chat on WhatsApp
            </a>
          </div>

          <h2>Contact Topics</h2>
          <ul>
            {CONTACT_TOPICS.map((topic) => (
              <li key={topic}>{topic}</li>
            ))}
          </ul>

          <p>
            Website:{" "}
            <a href="https://www.qsodates.com" target="_blank" rel="noopener noreferrer">
              www.qsodates.com
            </a>
          </p>
        </div>

        <p className="legal-signoff">73,<br />The QSODates.com Team</p>

        <p className="auth-footer-link">
          <Link href="/">← Back to calendar</Link>
        </p>
      </div>
    </div>
  );
}
