"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, LogOut } from "lucide-react";
import BrandMark from "@/components/BrandMark";
import InstallAppButton from "@/components/InstallAppButton";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";

interface TopbarProps {
  onAddActivity?: () => void;
  onLoginRequired?: () => void;
}

const MAIN_NAV = [
  { id: "home", label: "Home", href: "/" },
  { id: "activities", label: "Activities", href: "/activities" },
  { id: "calendar", label: "Calendar", href: "/calendar" },
  { id: "map", label: "Map", href: "/map" },
  { id: "api", label: "API", href: "/api-docs" },
  { id: "documents", label: "Documents", href: "/docs" },
  { id: "about", label: "About", href: "/about" },
] as const;

export function Topbar({ onAddActivity, onLoginRequired }: TopbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { isLoggedIn, canAccessAdmin, loading } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  const loginHref = `/login?next=${encodeURIComponent(pathname || "/")}`;

  const goToLogin = () => {
    closeMenu();
    onLoginRequired?.();
    router.push(`/login?next=${encodeURIComponent(pathname || "/")}`);
  };

  const handleAddActivity = () => {
    if (!isLoggedIn) {
      goToLogin();
      return;
    }
    closeMenu();
    onAddActivity?.();
  };

  async function handleLogout() {
    closeMenu();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  function navClass(href: string) {
    const active =
      href === "/"
        ? pathname === "/"
        : pathname === href || pathname.startsWith(`${href}/`);
    return active ? "nav-link active" : "nav-link";
  }

  const mobileMenu = menuOpen && mounted
    ? createPortal(
        <>
          <button type="button" className="mobile-overlay" aria-label="Close menu" onClick={closeMenu} />
          <div className="mobile-drawer" role="dialog" aria-modal="true" aria-label="Site menu">
            <div className="mobile-drawer-head">
              <BrandMark link={false} size="nav" />
              <button type="button" className="btn btn-ghost btn-sm" onClick={closeMenu} aria-label="Close">
                <X size={20} />
              </button>
            </div>
            <nav className="mobile-drawer-nav">
              {MAIN_NAV.map((item) => (
                <Link key={item.id} href={item.href} className={navClass(item.href)} onClick={closeMenu}>
                  {item.label}
                </Link>
              ))}
              <Link href="/dashboard" className="nav-link" onClick={closeMenu}>Profile</Link>
              {!loading && canAccessAdmin && (
                <Link href="/admin" className="nav-link" onClick={closeMenu}>Admin</Link>
              )}
              <Link href="/downloads" className="nav-link" onClick={closeMenu}>Downloads</Link>
            </nav>
            <div className="mobile-drawer-actions">
              <InstallAppButton variant="card" />
              <Link href="/contact" className="btn btn-ghost btn-sm" onClick={closeMenu}>Contact</Link>
              {isLoggedIn ? (
                <>
                  <Link href="/dashboard" className="btn btn-ghost btn-sm" onClick={closeMenu}>Account</Link>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={handleLogout}>
                    <LogOut size={14} aria-hidden="true" />
                    Logout
                  </button>
                  <button type="button" className="btn btn-primary" onClick={handleAddActivity}>Add Activity</button>
                </>
              ) : (
                <Link href={loginHref} className="btn btn-primary" onClick={closeMenu}>
                  Sign In to Add Activity
                </Link>
              )}
            </div>
          </div>
        </>,
        document.body
      )
    : null;

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <Link href="/" className="brand" aria-label="QSO Dates home">
            <BrandMark link={false} size="nav" />
          </Link>

          <nav className="topnav desktop-only" aria-label="Main navigation">
            {MAIN_NAV.map((item) => (
              <Link key={item.id} href={item.href} className={navClass(item.href)}>
                {item.label}
              </Link>
            ))}
            {!loading && canAccessAdmin && (
              <Link href="/admin" className={navClass("/admin")}>Admin</Link>
            )}
          </nav>

          <div className="topbar-actions desktop-only">
            <InstallAppButton />
            <Link href="/contact" className="btn btn-ghost btn-sm">Contact</Link>
            {isLoggedIn && (
              <>
                <Link href="/dashboard" className="btn btn-ghost btn-sm">Account</Link>
                <button type="button" className="btn btn-ghost btn-sm" onClick={handleLogout}>
                  <LogOut size={14} aria-hidden="true" />
                  Logout
                </button>
              </>
            )}
            {isLoggedIn ? (
              <button type="button" className="btn btn-primary btn-sm" onClick={handleAddActivity}>
                Add Activity
              </button>
            ) : (
              <Link href={loginHref} className="btn btn-primary btn-sm">
                Sign In to Add
              </Link>
            )}
          </div>

          <button
            type="button"
            className="mobile-menu-btn mobile-only"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={menuOpen}
          >
            <Menu size={22} />
          </button>
        </div>
      </header>
      {mobileMenu}
    </>
  );
}
