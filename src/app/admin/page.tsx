"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { fmtUTC } from "@/lib/activity-utils";

interface AdminData {
  online: { name: string; callsign: string; page: string; last_seen: string }[];
  support: { id: string; user_name: string; callsign: string; subject: string; message: string; status: string; created_at: string; reply?: string }[];
  activities: { id: string; name: string; type_name: string; callsign: string; start_at: string; profiles?: { name: string; callsign: string } }[];
  users: { id: string; name: string; callsign: string; email: string }[];
  socialPosts: { id: string; platform: string; status: string; activity_id: string; error_message?: string }[];
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState("users");
  const [data, setData] = useState<AdminData | null>(null);
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastMsg, setBroadcastMsg] = useState("");

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/admin?password=${encodeURIComponent(password)}`);
    if (res.ok) {
      setData(await res.json());
      setAuthed(true);
      sessionStorage.setItem("qsodates.admin", password);
    }
  };

  const refresh = async () => {
    const pw = sessionStorage.getItem("qsodates.admin") || password;
    const res = await fetch(`/api/admin?password=${encodeURIComponent(pw)}`);
    if (res.ok) setData(await res.json());
  };

  const resolveSupport = async (id: string) => {
    await fetch("/api/support", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "resolved" }),
    });
    refresh();
  };

  const deleteActivity = async (id: string) => {
    await fetch(`/api/activities/${id}`, { method: "DELETE" });
    refresh();
  };

  const sendBroadcast = async () => {
    const pw = sessionStorage.getItem("qsodates.admin") || password;
    await fetch("/api/broadcasts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: broadcastTitle, message: broadcastMsg, password: pw }),
    });
    setBroadcastTitle("");
    setBroadcastMsg("");
    alert("Broadcast sent to all users");
  };

  if (!authed) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div className="panel" style={{ maxWidth: 400, width: "100%", padding: 32 }}>
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <Image src="/logo.svg" alt="QSO Dates" width={64} height={64} />
            <h1 style={{ marginTop: 12 }}>QSO Dates Admin</h1>
            <p className="section-sub">Sign in to manage users, support, activities and broadcasts.</p>
          </div>
          <form onSubmit={login}>
            <label className="field">
              <span>Admin Password</span>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="no-cap" />
            </label>
            <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: 12 }}>Sign In</button>
            <p className="hint">Default: hamcaladmin</p>
          </form>
          <p style={{ textAlign: "center", marginTop: 20 }}>
            <Link href="/">← Back to calendar</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1>Admin Dashboard</h1>
          <p className="section-sub">Users · Support · Activities · Broadcasts · Social</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href="/" className="btn btn-ghost btn-sm">View Site</Link>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setAuthed(false)}>Logout</button>
        </div>
      </div>

      {data && (
        <div className="admin-stats">
          <div className="admin-stat"><span>Online Now</span><strong>{data.online.length}</strong></div>
          <div className="admin-stat"><span>Open Support</span><strong>{data.support.filter((s) => s.status === "open").length}</strong></div>
          <div className="admin-stat"><span>Activities</span><strong>{data.activities.length}</strong></div>
          <div className="admin-stat"><span>Users</span><strong>{data.users.length}</strong></div>
        </div>
      )}

      <div className="admin-tabs">
        {["users", "support", "activities", "broadcast", "social"].map((t) => (
          <button key={t} type="button" className={`admin-tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === "users" && data && (
        <div className="panel" style={{ overflow: "auto" }}>
          <table className="admin-table">
            <thead><tr><th>Name</th><th>Callsign</th><th>Email</th></tr></thead>
            <tbody>
              {data.users.map((u) => (
                <tr key={u.id}><td>{u.name}</td><td className="no-cap">{u.callsign}</td><td className="no-cap">{u.email}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "support" && data && (
        <div>
          {data.support.map((m) => (
            <div key={m.id} className="admin-card">
              <strong>{m.subject}</strong>
              <p className="section-sub no-cap">{m.user_name} · {m.callsign}</p>
              <p>{m.message}</p>
              {m.status === "open" && (
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => resolveSupport(m.id)}>Resolve</button>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === "activities" && data && (
        <div className="panel" style={{ overflow: "auto" }}>
          <table className="admin-table">
            <thead><tr><th>Activity</th><th>Type</th><th>Callsign</th><th>Schedule</th><th></th></tr></thead>
            <tbody>
              {data.activities.map((a) => (
                <tr key={a.id}>
                  <td>{a.name}</td>
                  <td>{a.type_name}</td>
                  <td className="no-cap">{a.callsign}</td>
                  <td className="no-cap">{fmtUTC(a.start_at)}</td>
                  <td><button type="button" className="btn btn-ghost btn-sm" onClick={() => deleteActivity(a.id)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "broadcast" && (
        <div className="panel" style={{ padding: 24 }}>
          <h3>Message All Users</h3>
          <label className="field"><span>Title</span><input value={broadcastTitle} onChange={(e) => setBroadcastTitle(e.target.value)} /></label>
          <label className="field"><span>Message</span><textarea rows={4} value={broadcastMsg} onChange={(e) => setBroadcastMsg(e.target.value)} /></label>
          <button type="button" className="btn btn-primary" onClick={sendBroadcast}>Send Broadcast</button>
        </div>
      )}

      {tab === "social" && data && (
        <div>
          <p className="section-sub">Auto-post log when activities are published to Facebook, Instagram, and X.</p>
          {data.socialPosts.map((p) => (
            <div key={p.id} className="admin-card">
              <strong className="no-cap">{p.platform}</strong> — {p.status}
              {p.error_message && <p style={{ color: "var(--text-muted)" }}>{p.error_message}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
