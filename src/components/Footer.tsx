import Link from "next/link";
import { LogoWordmark } from "@/components/LogoWordmark";
import { AdminNavLink } from "@/components/AdminNavLink";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
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
            <a
              href={SOCIAL_LINKS.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="social-btn social-btn-icon"
              aria-label="Chat on WhatsApp"
            >
              <WhatsAppIcon size={18} />
            </a>
          </div>
        </div>
        <div className="footer-col">
          <h4>Platform</h4>
          <ul>
            <li><Link href="/">Calendar</Link></li>
            <li><Link href="/dashboard">Profile</Link></li>
            <li><Link href="/dashboard/external-feeds">External Feeds</Link></li>
            <li><AdminNavLink /></li>
            <li><a href={SOCIAL_LINKS.github} target="_blank" rel="noopener noreferrer">GitHub</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Legal</h4>
          <ul>
            <li><Link href="/about">About</Link></li>
            <li><Link href="/terms">Terms of Service</Link></li>
            <li><Link href="/privacy">Privacy Policy</Link></li>
            <li><Link href="/content-agreement">Content Submission</Link></li>
            <li><Link href="/api-policy">API Policy</Link></li>
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
            <li>
              <a
                href={SOCIAL_LINKS.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-wa-link"
                aria-label="Chat on WhatsApp"
              >
                <WhatsAppIcon size={18} />
                <span>WhatsApp</span>
              </a>
            </li>
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
