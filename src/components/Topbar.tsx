import Image from "next/image";
import Link from "next/link";

interface TopbarProps {
  currentView?: "calendar" | "list";
  onViewChange?: (v: "calendar" | "list") => void;
  onAddActivity?: () => void;
  onSupport?: () => void;
}

export function Topbar({ currentView, onViewChange, onAddActivity, onSupport }: TopbarProps) {
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Link href="/" className="brand">
          <span className="brand-mark">
            <Image src="/logo.svg" alt="QSO Dates" width={44} height={44} priority />
          </span>
          <div className="brand-text">
            <strong>QSO Dates</strong>
            <small className="no-cap">www.qsodates.com</small>
          </div>
        </Link>

        <nav className="topnav" aria-label="Main navigation">
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
          <Link href="/dashboard" className="nav-link">
            Dashboard
          </Link>
        </nav>

        <div className="topbar-actions">
          <button type="button" className="btn btn-ghost btn-sm" onClick={onSupport}>
            Support
          </button>
          <Link href="/dashboard/profile" className="btn btn-ghost btn-sm">
            Profile
          </Link>
          <Link href="/admin" className="btn btn-ghost btn-sm">
            Admin
          </Link>
          <button type="button" className="btn btn-primary" onClick={onAddActivity}>
            Add Activity
          </button>
        </div>
      </div>
    </header>
  );
}
