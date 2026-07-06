"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { adminFetch } from "@/components/admin/useAdminData";
import type { HomepageContent } from "@/lib/siteSettings";
import { DEFAULT_HOMEPAGE } from "@/lib/siteSettings";

const FIELDS: { key: keyof HomepageContent; label: string; multiline?: boolean }[] = [
  { key: "eyebrow", label: "Eyebrow text" },
  { key: "title", label: "Main headline" },
  { key: "lead", label: "Lead paragraph", multiline: true },
  { key: "ctaPublish", label: "Publish button" },
  { key: "ctaBrowse", label: "Browse button" },
  { key: "ctaCalendar", label: "Calendar button" },
  { key: "statLive", label: "Stat: On air" },
  { key: "statTotal", label: "Stat: Total" },
  { key: "statApi", label: "Stat: API" },
  { key: "statUpcoming", label: "Stat: Upcoming" },
];

export default function AdminContentPage() {
  const [content, setContent] = useState<HomepageContent>(DEFAULT_HOMEPAGE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    adminFetch("/api/admin/homepage")
      .then((r) => r.json())
      .then((d) => { if (d.eyebrow) setContent(d); })
      .finally(() => setLoading(false));
  }, []);

  async function save() {
    setSaving(true);
    setMsg("");
    const res = await adminFetch("/api/admin/homepage", {
      method: "PATCH",
      body: JSON.stringify(content),
    });
    const data = await res.json();
    setSaving(false);
    setMsg(res.ok ? "Homepage updated." : data.error || "Save failed.");
  }

  if (loading) return <p className="section-sub">Loading…</p>;

  return (
    <div>
      <div className="admin-page-head">
        <div>
          <h1>Homepage content</h1>
          <p className="section-sub">Changes appear on the public home page after save.</p>
        </div>
        <Link href="/" className="btn btn-ghost btn-sm" target="_blank">Preview site</Link>
      </div>

      <div className="admin-content-form panel">
        {FIELDS.map((f) => (
          <label key={f.key} className="field">
            <span>{f.label}</span>
            {f.multiline ? (
              <textarea rows={4} value={content[f.key]} onChange={(e) => setContent({ ...content, [f.key]: e.target.value })} />
            ) : (
              <input value={content[f.key]} onChange={(e) => setContent({ ...content, [f.key]: e.target.value })} />
            )}
          </label>
        ))}
        {msg && <p className={msg.includes("updated") ? "auth-notice auth-notice--success" : "auth-notice auth-notice--error"}>{msg}</p>}
        <button type="button" className="btn btn-primary" disabled={saving} onClick={save}>
          {saving ? "Saving…" : "Save homepage"}
        </button>
      </div>
    </div>
  );
}
