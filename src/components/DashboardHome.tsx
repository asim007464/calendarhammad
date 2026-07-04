"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export function DashboardHome() {
  const { canAccessAdmin, loading } = useAuth();

  return (
    <div className="panel" style={{ padding: 24 }}>
      <h1 className="section-title">Profile</h1>
      <p className="section-sub">
        Welcome to QSO Dates — manage your profile and amateur radio activities.
      </p>

      <div className="admin-stats" style={{ marginTop: 24 }}>
        <div className="admin-stat">
          <span>Profile</span>
          <strong style={{ fontSize: 16 }}>Edit Your Digital Card</strong>
          <Link href="/dashboard/profile" className="btn btn-ghost btn-sm" style={{ marginTop: 12 }}>
            Open
          </Link>
        </div>

        {!loading && canAccessAdmin && (
          <>
            <div className="admin-stat">
              <span>Analytics</span>
              <strong style={{ fontSize: 16 }}>GA + Clarity</strong>
              <Link href="/dashboard/analytics" className="btn btn-ghost btn-sm" style={{ marginTop: 12 }}>
                View
              </Link>
            </div>
            <div className="admin-stat">
              <span>Calendar</span>
              <strong style={{ fontSize: 16 }}>Public Site</strong>
              <Link href="/" className="btn btn-ghost btn-sm" style={{ marginTop: 12 }}>
                Open
              </Link>
            </div>
          </>
        )}
      </div>

      {!loading && canAccessAdmin && (
        <div className="panel" style={{ marginTop: 24, padding: 20 }}>
          <h3>Recent Activity Feed</h3>
          <p className="section-sub">
            Views, clicks, and site interactions — admin overview for qsodates.com.
          </p>
          <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 12 }}>
            Open Analytics for Google Analytics and Microsoft Clarity reports.
          </p>
          <Link href="/dashboard/analytics" className="btn btn-ghost btn-sm" style={{ marginTop: 12 }}>
            View Analytics
          </Link>
        </div>
      )}
    </div>
  );
}
