import Link from "next/link";
import { LogoWordmark } from "@/components/LogoWordmark";
import { SOCIAL_LINKS } from "@/types/database";

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <Link href="/" className="brand-mark-link footer-logo" aria-label="QSO Dates home">
            <LogoWordmark size="footer" />
          </Link>
          <p>
            Your worldwide hub for amateur radio activities — ham radio contests, special event stations,
            POTA, SOTA, DXpeditions, nets, and field days.
          </p>
          <div className="social-row">
            <a href={SOCIAL_LINKS.github} target="_blank" rel="noopener noreferrer" className="social-btn">
              GitHub
            </a>
            <a href={SOCIAL_LINKS.facebook} target="_blank" rel="noopener noreferrer" className="social-btn">
              Facebook
            </a>
            <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" className="social-btn">
              Instagram
            </a>
            <a href={SOCIAL_LINKS.x} target="_blank" rel="noopener noreferrer" className="social-btn">
              X
            </a>
            <a href={SOCIAL_LINKS.whatsapp} target="_blank" rel="noopener noreferrer" className="social-btn">
              WhatsApp {SOCIAL_LINKS.whatsappDisplay}
            </a>
          </div>
        </div>
        <div className="footer-col">
          <h4>Platform</h4>
          <ul>
            <li><Link href="/">Calendar</Link></li>
            <li><Link href="/dashboard">Dashboard</Link></li>
            <li><Link href="/dashboard/external-feeds">External Feeds</Link></li>
            <li><Link href="/admin">Admin</Link></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Resources</h4>
          <ul>
            <li><a href={SOCIAL_LINKS.github} target="_blank" rel="noopener noreferrer">GitHub</a></li>
            <li><Link href="/dashboard/analytics">Analytics</Link></li>
            <li><a href="https://www.openrepeater.org" target="_blank" rel="noopener noreferrer">OpenRepeater</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Developers</h4>
          <ul>
            <li><Link href="/docs">API Docs</Link></li>
            <li><Link href="/api-docs">API Portal</Link></li>
            <li><Link href="/downloads">Downloads</Link></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Contact</h4>
          <ul>
            <li><Link href="/contact">Contact Us</Link></li>
            <li><a href={SOCIAL_LINKS.whatsapp} target="_blank" rel="noopener noreferrer">{SOCIAL_LINKS.whatsappDisplay}</a></li>
            <li><a href={SOCIAL_LINKS.site}>www.qsodates.com</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        © {new Date().getFullYear()} QSO Dates · Amateur Radio Activity Calendar · 73!
      </div>
    </footer>
  );
}
