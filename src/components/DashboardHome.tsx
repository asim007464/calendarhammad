"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export function DashboardHome() {
  const { canAccessAdmin, loading } = useAuth();

  return (
    <div className="panel" style={{ padding: 24 }}>
      <h1 className="section-title">Profile</h1>
      <p className="section-sub">
        Welcome to QSO Dates. Manage your profile and amateur radio activities here.
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
          <div className="admin-stat">
            <span>Admin</span>
            <strong style={{ fontSize: 16 }}>Site Management</strong>
            <Link href="/admin" className="btn btn-ghost btn-sm" style={{ marginTop: 12 }}>
              Open Admin
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
