"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

const NAV = [
  { href: "/dashboard", label: "Home" },
  { href: "/dashboard/profile", label: "Edit Profile" },
  { href: "/dashboard/external-feeds", label: "External Feeds" },
  { href: "/dashboard/analytics", label: "Analytics" },
  { href: "/admin", label: "Admin" },
];

export function DashboardNav() {
  const path = usePathname();
  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <Link href="/" className="brand">
            <span className="brand-mark">
              <Image src="/logo.svg" alt="QSO Dates" width={44} height={44} />
            </span>
            <div className="brand-text">
              <strong>QSO Dates</strong>
              <small className="no-cap">Dashboard</small>
            </div>
          </Link>
          <Link href="/" className="btn btn-ghost btn-sm">← Calendar</Link>
        </div>
      </header>
      <div className="dashboard-shell">
        <nav className="dash-nav">
          <h3>Menu</h3>
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className={path === item.href ? "active" : ""}>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <Link href="/" className="brand">
            <span className="brand-mark">
              <Image src="/logo.svg" alt="QSO Dates" width={44} height={44} />
            </span>
            <div className="brand-text">
              <strong>QSO Dates</strong>
              <small className="no-cap">Dashboard</small>
            </div>
          </Link>
          <Link href="/" className="btn btn-ghost btn-sm">← Calendar</Link>
        </div>
      </header>
      <div className="dashboard-shell">
        <nav className="dash-nav">
          <h3>Menu</h3>
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className={path === item.href ? "active" : ""}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="dash-content">{children}</div>
      </div>
    </>
  );
}
