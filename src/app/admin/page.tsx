"use client";

import Link from "next/link";
import { useAdminData } from "@/components/admin/useAdminData";

export default function AdminDashboardPage() {
  const { data, loading } = useAdminData();

  if (loading) return <p className="section-sub">Loading dashboard…</p>;

  return (
    <div>
      <div className="admin-page-head">
        <div>
          <h1>Admin Dashboard</h1>
          <p className="section-sub">Overview of users, support, activities and broadcasts</p>
        </div>
        <Link href="/" className="btn btn-ghost btn-sm">View Site</Link>
      </div>

      {data && (
        <>
          <div className="admin-stats">
            <div className="admin-stat"><span>Online Now</span><strong>{data.online.length}</strong></div>
            <div className="admin-stat"><span>Open Support</span><strong>{data.support.filter((s) => s.status === "open").length}</strong></div>
            <div className="admin-stat"><span>Activities</span><strong>{data.activities.length}</strong></div>
            <div className="admin-stat"><span>Users</span><strong>{data.users.length}</strong></div>
          </div>

          <div className="admin-quick-grid">
            <Link href="/admin/users" className="admin-quick-card panel">Users & roles →</Link>
            <Link href="/admin/support" className="admin-quick-card panel">Support inbox →</Link>
            <Link href="/admin/activities" className="admin-quick-card panel">Manage activities →</Link>
            <Link href="/admin/broadcast" className="admin-quick-card panel">Send broadcast →</Link>
          </div>
        </>
      )}
    </div>
  );
}
