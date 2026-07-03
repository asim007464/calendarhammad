import Link from "next/link";
import { SOCIAL_LINKS } from "@/types/database";

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <strong>QSO Dates</strong>
          <p>
            Your worldwide hub for amateur radio activities — contests, special events, POTA, SOTA,
            DXpeditions, nets and field days.
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
          <h4>Contact</h4>
          <ul>
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
