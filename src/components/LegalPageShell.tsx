import Link from "next/link";
import BrandMark from "@/components/BrandMark";
import { LEGAL_NAV } from "@/lib/legalNav";

interface LegalPageShellProps {
  title: string;
  effectiveDate?: string;
  currentPath: string;
  children: React.ReactNode;
}

export function LegalPageShell({ title, effectiveDate, currentPath, children }: LegalPageShellProps) {
  return (
    <div className="legal-page">
      <div className="legal-inner">
        <header className="legal-header">
          <Link href="/">
            <BrandMark link={false} size="auth" />
          </Link>
          <h1>{title}</h1>
          {effectiveDate && <p className="legal-effective">Effective {effectiveDate}</p>}
        </header>

        <nav className="legal-nav panel" aria-label="Legal pages">
          {LEGAL_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={currentPath === item.href ? "active" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <article className="legal-content panel">{children}</article>

        <p className="legal-signoff">73,<br />The QSODates.com Team</p>

        <p className="auth-footer-link">
          <Link href="/">← Back to calendar</Link>
        </p>
      </div>
    </div>
  );
}
