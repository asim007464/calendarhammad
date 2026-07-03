"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import BrandMark from "@/components/BrandMark";
import { useAuth } from "@/hooks/useAuth";

type NavItem = {
  href: string;
  label: string;
  adminOnly?: boolean;
};

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Home" },
  { href: "/dashboard/profile", label: "Edit Profile" },
  { href: "/dashboard/external-feeds", label: "External Feeds" },
  { href: "/dashboard/analytics", label: "Analytics" },
  { href: "/admin", label: "Admin", adminOnly: true },
];

function DashboardNavLinks({ path }: { path: string }) {
  const { canAccessAdmin, loading } = useAuth();
  const items = NAV.filter((item) => !item.adminOnly || (!loading && canAccessAdmin));

  return items.map((item) => (
    <Link key={item.href} href={item.href} className={path === item.href ? "active" : ""}>
      {item.label}
    </Link>
  ));
}

export function DashboardNav() {
  const path = usePathname();
  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <Link href="/" className="brand">
            <BrandMark link={false} size="nav" />
            <small className="no-cap brand-sub">Dashboard</small>
          </Link>
          <Link href="/" className="btn btn-ghost btn-sm">← Calendar</Link>
        </div>
      </header>
      <div className="dashboard-shell">
        <nav className="dash-nav">
          <h3>Menu</h3>
          <DashboardNavLinks path={path} />
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
            <BrandMark link={false} size="nav" />
            <small className="no-cap brand-sub">Dashboard</small>
          </Link>
          <Link href="/" className="btn btn-ghost btn-sm">← Calendar</Link>
        </div>
      </header>
      <div className="dashboard-shell">
        <nav className="dash-nav">
          <h3>Menu</h3>
          <DashboardNavLinks path={path} />
        </nav>
        <div className="dash-content">{children}</div>
      </div>
    </>
  );
}
