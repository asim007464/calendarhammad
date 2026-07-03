"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import BrandMark from "@/components/BrandMark";
import InstallAppButton from "@/components/InstallAppButton";
import { useAuth } from "@/hooks/useAuth";

interface TopbarProps {
  currentView?: "calendar" | "list";
  onViewChange?: (v: "calendar" | "list") => void;
  onAddActivity?: () => void;
  onSupport?: () => void;
}

export function Topbar({ currentView, onViewChange, onAddActivity, onSupport }: TopbarProps) {
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

  const mobileMenu = menuOpen && mounted
    ? createPortal(
        <>
          <button
            type="button"
            className="mobile-overlay"
            aria-label="Close menu"
            onClick={closeMenu}
          />
          <div className="mobile-drawer" role="dialog" aria-modal="true" aria-label="Site menu">
            <div className="mobile-drawer-head">
              <BrandMark link={false} size="nav" />
              <button type="button" className="btn btn-ghost btn-sm" onClick={closeMenu} aria-label="Close">
                <X size={20} />
              </button>
            </div>
            <nav className="mobile-drawer-nav">
              <button type="button" className="nav-link" onClick={() => { onViewChange?.("calendar"); closeMenu(); }}>Calendar</button>
              <button type="button" className="nav-link" onClick={() => { onViewChange?.("list"); closeMenu(); }}>Activities</button>
              <Link href="/dashboard" className="nav-link" onClick={closeMenu}>Profile</Link>
              {!loading && canAccessAdmin && (
                <Link href="/admin" className="nav-link" onClick={closeMenu}>Admin</Link>
              )}
              <Link href="/docs" className="nav-link" onClick={closeMenu}>API Docs</Link>
              <Link href="/api-docs" className="nav-link" onClick={closeMenu}>API Portal</Link>
              <Link href="/downloads" className="nav-link" onClick={closeMenu}>Downloads</Link>
              <Link href="/contact" className="nav-link" onClick={closeMenu}>Contact</Link>
              {isLoggedIn ? (
                <Link href="/dashboard" className="nav-link" onClick={closeMenu}>Account</Link>
              ) : (
                <Link href="/login" className="nav-link" onClick={closeMenu}>Sign In</Link>
              )}
            </nav>
            <div className="mobile-drawer-actions">
              <InstallAppButton variant="card" />
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => { onSupport?.(); closeMenu(); }}>Support</button>
              <button type="button" className="btn btn-primary" onClick={() => { onAddActivity?.(); closeMenu(); }}>Add Activity</button>
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
          <Link href="/" className="brand">
            <BrandMark link={false} size="nav" />
          </Link>

          <nav className="topnav desktop-only" aria-label="Main navigation">
            <button
              type="button"
              className={`nav-link ${currentView === "calendar" ? "active" : ""}`}
              onClick={() => onViewChange?.("calendar")}
            >
              Calendar
            </button>
            <button
              type="button"
              className={`nav-link ${currentView === "list" ? "active" : ""}`}
              onClick={() => onViewChange?.("list")}
            >
              Activities
            </button>
            <Link href="/dashboard" className="nav-link">Profile</Link>
            {!loading && canAccessAdmin && (
              <Link href="/admin" className="nav-link">Admin</Link>
            )}
            <Link href="/docs" className="nav-link">API</Link>
            <Link href="/downloads" className="nav-link">Downloads</Link>
          </nav>

          <div className="topbar-actions desktop-only">
            <InstallAppButton />
            <button type="button" className="btn btn-ghost btn-sm" onClick={onSupport}>Support</button>
            {isLoggedIn ? (
              <Link href="/dashboard" className="btn btn-ghost btn-sm">Account</Link>
            ) : (
              <Link href="/login" className="btn btn-ghost btn-sm">Sign In</Link>
            )}
            <button type="button" className="btn btn-primary btn-sm" onClick={onAddActivity}>Add Activity</button>
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
