import Link from "next/link";
import { LogoWordmark } from "@/components/LogoWordmark";
import { AdminNavLink } from "@/components/AdminNavLink";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { FacebookIcon, GithubIcon, InstagramIcon, XIcon } from "@/components/SocialIcons";
import { SOCIAL_LINKS } from "@/types/database";

const SOCIAL_ITEMS = [
  { href: SOCIAL_LINKS.github, label: "GitHub", Icon: GithubIcon },
  { href: SOCIAL_LINKS.facebook, label: "Facebook", Icon: FacebookIcon },
  { href: SOCIAL_LINKS.instagram, label: "Instagram", Icon: InstagramIcon },
  { href: SOCIAL_LINKS.x, label: "X", Icon: XIcon },
  { href: SOCIAL_LINKS.whatsapp, label: "WhatsApp", Icon: WhatsAppIcon },
];

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <Link href="/" className="brand-mark-link footer-logo" aria-label="QSO Dates home">
            <LogoWordmark size="footer" />
          </Link>
          <p className="footer-tagline">
            Your Worldwide Hub For Amateur Radio Activities. Ham radio contests, special event stations,{" "}
            <span className="no-cap">POTA</span>, <span className="no-cap">SOTA</span>, DXpeditions, Nets, And Field Days.
          </p>
          <div className="social-row">
            {SOCIAL_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="social-btn social-btn-icon-only"
                aria-label={item.label}
                title={item.label}
              >
                <item.Icon size={20} />
              </a>
            ))}
          </div>
        </div>
        <div className="footer-col">
          <h4>Platform</h4>
          <ul>
            <li><Link href="/">Calendar</Link></li>
            <li><Link href="/dashboard">Profile</Link></li>
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
          <h4>API</h4>
          <ul>
            <li><Link href="/docs">Documents</Link></li>
            <li><Link href="/api-docs">API Portal</Link></li>
            <li><Link href="/downloads">Downloads</Link></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Contact</h4>
          <ul>
            <li><Link href="/contact">Contact Us</Link></li>
            <li><a href={SOCIAL_LINKS.site} className="no-cap">www.qsodates.com</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        © {new Date().getFullYear()} QSO Dates. Amateur Radio Activity Calendar. 73!
      </div>
    </footer>
  );
}
