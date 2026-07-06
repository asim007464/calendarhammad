"use client";

import Link from "next/link";
import { Topbar } from "@/components/Topbar";
import { Footer } from "@/components/Footer";
import { ContactForm } from "@/components/ContactForm";
import { LEGAL_NAV } from "@/lib/legalNav";

const CONTACT_TOPICS = [
  "General support",
  "Privacy requests",
  "Copyright complaints",
  "Legal notices",
  "API questions",
];

export function ContactPageClient() {
  return (
    <>
      <Topbar />
      <div className="legal-page">
        <div className="legal-inner">
          <header className="legal-header">
            <h1>Contact</h1>
            <p className="section-sub">
              Send us a message below. We reply as soon as we can.
            </p>
          </header>

          <nav className="legal-nav panel" aria-label="Legal pages">
            {LEGAL_NAV.map((item) => (
              <Link key={item.href} href={item.href} className={item.href === "/contact" ? "active" : undefined}>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="legal-stack">
            <div className="legal-content panel" id="contact-form">
              <h2>Send a message</h2>
              <p className="section-sub">Your message goes straight to our team inbox.</p>
              <ContactForm />
            </div>

            <div className="legal-content panel">
              <h2>Contact topics</h2>
              <ul>
                {CONTACT_TOPICS.map((topic) => (
                  <li key={topic}>{topic}</li>
                ))}
              </ul>
              <p>
                Website:{" "}
                <a href="https://www.qsodates.com" target="_blank" rel="noopener noreferrer" className="no-cap">
                  www.qsodates.com
                </a>
              </p>
            </div>
          </div>

          <p className="legal-signoff">73,<br />The QSODates.com Team</p>

          <p className="auth-footer-link">
            <Link href="/">Back to calendar</Link>
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
}
