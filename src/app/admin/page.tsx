"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Users, MessageSquare, Calendar, ShieldAlert, ShieldCheck, Home, Megaphone, Sparkles,
} from "lucide-react";
import { adminFetch, useAdminData } from "@/components/admin/useAdminData";

export default function AdminDashboardPage() {
  const { data, loading, refresh } = useAdminData();
  const [lockMsg, setLockMsg] = useState("");
  const [busy, setBusy] = useState("");

  if (loading) return <p className="section-sub">Loading dashboard…</p>;
  if (!data) return <p className="section-sub">Could not load dashboard.</p>;

  const lockdownOn = data.lockdown.enabled;

  async function toggleLockdown(enable: boolean) {
    if (!data) return;
    setBusy("lockdown");
    await adminFetch("/api/admin/lockdown", {
      method: enable ? "POST" : "DELETE",
      body: JSON.stringify({ enabled: enable, message: lockMsg || data.lockdown.message }),
    });
    await refresh();
    setBusy("");
  }

  async function unlockSite() {
    setBusy("unlock");
    await adminFetch("/api/site/unlock", { method: "PATCH" });
    await refresh();
    setBusy("");
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-page-head">
        <div>
          <h1>Admin Dashboard</h1>
          <p className="section-sub">
            Welcome{data.session.name ? `, ${data.session.name}` : ""}. Manage QSO Dates from here.
          </p>
        </div>
        <Link href="/" className="btn btn-ghost btn-sm">View Site</Link>
      </div>

      <div className="admin-stats admin-stats--rich">
        <div className="admin-stat admin-stat--card">
          <Users size={18} />
          <span>Users</span>
          <strong>{data.stats.totalUsers}</strong>
        </div>
        <div className="admin-stat admin-stat--card">
          <Calendar size={18} />
          <span>Activities</span>
          <strong>{data.stats.totalActivities}</strong>
        </div>
        <div className="admin-stat admin-stat--card admin-stat--warn">
          <Calendar size={18} />
          <span>Pending approval</span>
          <strong>{data.stats.pendingActivities}</strong>
        </div>
        <div className="admin-stat admin-stat--card">
          <MessageSquare size={18} />
          <span>Open support</span>
          <strong>{data.stats.openSupport}</strong>
        </div>
        <div className="admin-stat admin-stat--card">
          <Sparkles size={18} />
          <span>Online now</span>
          <strong>{data.online.length}</strong>
        </div>
      </div>

      <div className="admin-dash-grid">
        <section className={`admin-panel-card panel ${lockdownOn ? "admin-panel-card--danger" : ""}`}>
          <div className="admin-panel-card-head">
            {lockdownOn ? <ShieldAlert size={20} /> : <ShieldCheck size={20} />}
            <div>
              <h2>Emergency site lockdown</h2>
              <p className="section-sub">
                {lockdownOn
                  ? "Public site is offline. Only admin routes work."
                  : "Shut down the public website instantly for maintenance or emergencies."}
              </p>
            </div>
          </div>
          <label className="field">
            <span>Maintenance message (shown to visitors)</span>
            <textarea
              rows={3}
              value={lockMsg || data.lockdown.message}
              onChange={(e) => setLockMsg(e.target.value)}
              disabled={lockdownOn && !data.session.isSuperAdmin}
            />
          </label>
          <div className="admin-panel-actions">
            {!lockdownOn ? (
              <button
                type="button"
                className="btn btn-primary"
                disabled={busy === "lockdown"}
                onClick={() => toggleLockdown(true)}
              >
                {busy === "lockdown" ? "Shutting down…" : "Shutdown website"}
              </button>
            ) : data.session.isSuperAdmin ? (
              <button
                type="button"
                className="btn btn-primary"
                disabled={busy === "unlock"}
                onClick={unlockSite}
              >
                {busy === "unlock" ? "Restoring…" : "Restore website (developer)"}
              </button>
            ) : (
              <p className="auth-hint" style={{ textAlign: "left" }}>
                Only the developer super-admin can restore the site. See LOCKDOWN_RECOVERY.md in the project.
              </p>
            )}
          </div>
        </section>

        <section className="admin-panel-card panel">
          <div className="admin-panel-card-head">
            <Home size={20} />
            <div>
              <h2>Homepage content</h2>
              <p className="section-sub">Edit hero text and stat labels on the public home page.</p>
            </div>
          </div>
          <Link href="/admin/content" className="btn btn-outline">Edit homepage</Link>
        </section>

        <Link href="/admin/activities" className="admin-quick-card panel admin-quick-card--rich">
          <Calendar size={20} />
          <div>
            <strong>Activities</strong>
            <span>{data.stats.pendingActivities} awaiting approval</span>
          </div>
        </Link>
        <Link href="/admin/users" className="admin-quick-card panel admin-quick-card--rich">
          <Users size={20} />
          <div>
            <strong>Users and roles</strong>
            <span>{data.stats.totalUsers} registered members</span>
          </div>
        </Link>
        <Link href="/admin/support" className="admin-quick-card panel admin-quick-card--rich">
          <MessageSquare size={20} />
          <div>
            <strong>Support inbox</strong>
            <span>{data.stats.openSupport} open messages</span>
          </div>
        </Link>
        <Link href="/admin/broadcast" className="admin-quick-card panel admin-quick-card--rich">
          <Megaphone size={20} />
          <div>
            <strong>Broadcast</strong>
            <span>Send site-wide announcement</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
