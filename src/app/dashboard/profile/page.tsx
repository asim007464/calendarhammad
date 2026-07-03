"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import type { ExternalFeedItem } from "@/types/database";
import { SOCIAL_LINKS } from "@/types/database";

export default function ProfilePage() {
  const [name, setName] = useState("");
  const [callsign, setCallsign] = useState("");
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");
  const [qrz, setQrz] = useState("");
  const [externalItems, setExternalItems] = useState<ExternalFeedItem[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/external-feeds")
      .then((r) => r.ok ? r.json() : { items: [] })
      .then((d) => setExternalItems(d.items?.slice(0, 3) || []));
  }, []);

  const save = () => {
    localStorage.setItem("qsodates.profile", JSON.stringify({ name, callsign, bio, website, qrz }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem("qsodates.profile");
      if (raw) {
        const p = JSON.parse(raw);
        setName(p.name || "");
        setCallsign(p.callsign || "");
        setBio(p.bio || "");
        setWebsite(p.website || "");
        setQrz(p.qrz || "");
      }
    } catch {}
  }, []);

  const initials = (callsign || name || "Q").slice(0, 2).toUpperCase();

  return (
    <DashboardLayout>
      <div className="digital-card">
        <div className="digital-card-header">
          <div className="avatar">{initials}</div>
          <div>
            <h2 className="no-cap" style={{ margin: "0 0 4px" }}>{name || "Your Name"}</h2>
            <p className="section-sub no-cap">{callsign || "CALLSIGN"} · QSO Dates</p>
            {bio && <p style={{ marginTop: 8, fontSize: 14 }}>{bio}</p>}
          </div>
        </div>
        {externalItems.length > 0 && (
          <div>
            <h4>Recent External Activity</h4>
            {externalItems.map((item) => (
              <div key={item.id} className="feed-card" style={{ marginTop: 8 }}>
                <strong>{item.title}</strong>
                <p style={{ margin: "4px 0 0", fontSize: 13 }}>{item.summary}</p>
              </div>
            ))}
          </div>
        )}
        <div className="social-row" style={{ marginTop: 16 }}>
          <a href={SOCIAL_LINKS.github} target="_blank" rel="noopener noreferrer" className="social-btn">GitHub</a>
          <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" className="social-btn">Instagram</a>
          <a href={SOCIAL_LINKS.x} target="_blank" rel="noopener noreferrer" className="social-btn">X</a>
        </div>
      </div>

      <div className="panel" style={{ padding: 24 }}>
        <h2 className="section-title">Edit Profile</h2>
        <label className="field">
          <span>Name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="field">
          <span>Callsign</span>
          <input className="no-cap" value={callsign} onChange={(e) => setCallsign(e.target.value)} />
        </label>
        <label className="field">
          <span>Bio</span>
          <textarea rows={3} value={bio} onChange={(e) => setBio(e.target.value)} />
        </label>
        <div className="grid2">
          <label className="field">
            <span>Website</span>
            <input className="no-cap" value={website} onChange={(e) => setWebsite(e.target.value)} />
          </label>
          <label className="field">
            <span>QRZ</span>
            <input className="no-cap" value={qrz} onChange={(e) => setQrz(e.target.value)} />
          </label>
        </div>
        <button type="button" className="btn btn-primary" onClick={save}>
          {saved ? "Saved!" : "Save Profile"}
        </button>
      </div>
    </DashboardLayout>
  );
}
