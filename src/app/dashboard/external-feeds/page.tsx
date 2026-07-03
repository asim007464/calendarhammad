"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import type { ExternalFeed, ExternalFeedItem } from "@/types/database";

export default function ExternalFeedsPage() {
  const [feeds, setFeeds] = useState<ExternalFeed[]>([]);
  const [items, setItems] = useState<ExternalFeedItem[]>([]);
  const [ehamUser, setEhamUser] = useState("");
  const [ehamKey, setEhamKey] = useState("");
  const [cqUser, setCqUser] = useState("");
  const [cqKey, setCqKey] = useState("");
  const [msg, setMsg] = useState("");

  const load = async () => {
    const res = await fetch("/api/external-feeds");
    if (res.ok) {
      const data = await res.json();
      setFeeds(data.feeds);
      setItems(data.items);
    }
  };

  useEffect(() => { load(); }, []);

  const connect = async (platform: "ehamhub" | "cqhams") => {
    const body =
      platform === "ehamhub"
        ? { platform, username: ehamUser, api_key: ehamKey }
        : { platform, username: cqUser, api_key: cqKey };
    const res = await fetch("/api/external-feeds", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) { setMsg(`${platform} connected`); load(); }
    else setMsg("Connect failed — sign in may be required");
  };

  const sync = async (platform: "ehamhub" | "cqhams") => {
    const res = await fetch("/api/external-feeds", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ platform, action: "sync" }),
    });
    if (res.ok) {
      const data = await res.json();
      setMsg(`Synced ${data.synced} items from ${platform}`);
      load();
    }
  };

  return (
    <DashboardLayout>
      <div className="panel" style={{ padding: 24, marginBottom: 20 }}>
        <h1 className="section-title">External Feeds</h1>
        <p className="section-sub">
          Connect eHamHub and CQHams to pull recent activity, posts, and statistics into your profile.
        </p>
        {msg && <p style={{ color: "var(--brand-light)", marginTop: 12 }}>{msg}</p>}
      </div>

      <div className="grid2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div className="panel" style={{ padding: 20 }}>
          <h3>eHamHub</h3>
          <p className="section-sub">Link your eHamHub account for QSO stats and posts.</p>
          <label className="field">
            <span>Username</span>
            <input className="no-cap" value={ehamUser} onChange={(e) => setEhamUser(e.target.value)} />
          </label>
          <label className="field">
            <span>API Key (optional)</span>
            <input className="no-cap" type="password" value={ehamKey} onChange={(e) => setEhamKey(e.target.value)} />
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => connect("ehamhub")}>Connect</button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => sync("ehamhub")}>Sync Now</button>
          </div>
        </div>

        <div className="panel" style={{ padding: 20 }}>
          <h3>CQHams</h3>
          <p className="section-sub">Link CQHams for recent posts and club activity.</p>
          <label className="field">
            <span>Username</span>
            <input className="no-cap" value={cqUser} onChange={(e) => setCqUser(e.target.value)} />
          </label>
          <label className="field">
            <span>API Key (optional)</span>
            <input className="no-cap" type="password" value={cqKey} onChange={(e) => setCqKey(e.target.value)} />
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => connect("cqhams")}>Connect</button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => sync("cqhams")}>Sync Now</button>
          </div>
        </div>
      </div>

      <div className="panel" style={{ padding: 20, marginTop: 20 }}>
        <h3>Recent External Activity</h3>
        {items.length === 0 ? (
          <p style={{ color: "var(--text-muted)" }}>No feed items yet. Connect and sync a platform above.</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="feed-card">
              <h4 className="no-cap">{item.title}</h4>
              <p>{item.summary}</p>
              {item.url && (
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="no-cap">
                  View →
                </a>
              )}
            </div>
          ))
        )}
      </div>

      <div className="panel" style={{ padding: 16, marginTop: 20, fontSize: 13, color: "var(--text-muted)" }}>
        <strong>Security &amp; Permissions</strong>
        <p>API keys are stored securely and only used to sync your own feed data. You control which platforms are connected and can disconnect at any time.</p>
      </div>
    </DashboardLayout>
  );
}
