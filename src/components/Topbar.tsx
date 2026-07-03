"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";import BrandMark from "@/components/BrandMark";
import InstallAppButton from "@/components/InstallAppButton";

interface TopbarProps {
  currentView?: "calendar" | "list";
  onViewChange?: (v: "calendar" | "list") => void;
  onAddActivity?: () => void;
  onSupport?: () => void;
}

export function Topbar({ currentView, onViewChange, onAddActivity, onSupport }: TopbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
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
          <Link href="/dashboard" className="nav-link">Dashboard</Link>
          <Link href="/docs" className="nav-link">API</Link>
          <Link href="/downloads" className="nav-link">Downloads</Link>
        </nav>

        <div className="topbar-actions desktop-only">
          <InstallAppButton />
          <button type="button" className="btn btn-ghost btn-sm" onClick={onSupport}>Support</button>
          <Link href="/login" className="btn btn-ghost btn-sm">Sign In</Link>
          <button type="button" className="btn btn-primary btn-sm" onClick={onAddActivity}>Add Activity</button>
        </div>

        <button
          type="button"
          className="mobile-menu-btn mobile-only"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>
      </div>

      {menuOpen && (
        <>
          <button type="button" className="mobile-overlay" aria-label="Close menu" onClick={() => setMenuOpen(false)} />
          <div className="mobile-drawer">
            <div className="mobile-drawer-head">
              <BrandMark link={false} size="nav" />
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setMenuOpen(false)} aria-label="Close">
                <X size={20} />
              </button>
            </div>
            <nav className="mobile-drawer-nav">
              <button type="button" className="nav-link" onClick={() => { onViewChange?.("calendar"); setMenuOpen(false); }}>Calendar</button>
              <button type="button" className="nav-link" onClick={() => { onViewChange?.("list"); setMenuOpen(false); }}>Activities</button>
              <Link href="/dashboard" className="nav-link" onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <Link href="/docs" className="nav-link" onClick={() => setMenuOpen(false)}>API Docs</Link>
              <Link href="/api-docs" className="nav-link" onClick={() => setMenuOpen(false)}>API Portal</Link>
              <Link href="/downloads" className="nav-link" onClick={() => setMenuOpen(false)}>Downloads</Link>
              <Link href="/contact" className="nav-link" onClick={() => setMenuOpen(false)}>Contact</Link>
              <Link href="/login" className="nav-link" onClick={() => setMenuOpen(false)}>Sign In</Link>
            </nav>
            <div className="mobile-drawer-actions">
              <InstallAppButton variant="card" />
              <button type="button" className="btn btn-primary" onClick={() => { onAddActivity?.(); setMenuOpen(false); }}>Add Activity</button>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
