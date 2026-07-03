"use client";

import { useState } from "react";
import Link from "next/link";
import BrandMark from "@/components/BrandMark";
import InstallAppButton from "@/components/InstallAppButton";

export default function DownloadsPage() {
  const [format, setFormat] = useState("json");
  const [type, setType] = useState("");
  const [country, setCountry] = useState("");

  const downloadUrl = () => {
    const params = new URLSearchParams({ format });
    if (type) params.set("type", type);
    if (country) params.set("country", country);
    return `/api/downloads?${params.toString()}`;
  };

  return (
    <div className="docs-page">
      <div className="docs-inner">
        <div className="docs-header">
          <BrandMark link={false} size="auth" />
          <h1>Download Ham Radio Activities</h1>
          <p className="section-sub">
            Export published amateur radio events as JSON or CSV — ham radio contests, POTA, SOTA, and more.
            Free to use — no API key required.
          </p>
        </div>

        <InstallAppButton variant="card" className="mb-20" />

        <div className="panel" style={{ padding: 24 }}>
          <div className="grid2">
            <label className="field">
              <span>Format</span>
              <select value={format} onChange={(e) => setFormat(e.target.value)}>
                <option value="json">JSON</option>
                <option value="csv">CSV</option>
              </select>
            </label>
            <label className="field">
              <span>Activity type (optional)</span>
              <input value={type} onChange={(e) => setType(e.target.value)} placeholder="Contest, POTA…" />
            </label>
            <label className="field">
              <span>Country (optional)</span>
              <input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="United States" />
            </label>
          </div>
          <a href={downloadUrl()} className="btn btn-primary" download>
            Download {format.toUpperCase()}
          </a>
          <p className="hint" style={{ marginTop: 16 }}>
            For programmatic access with filters and pagination, use the{" "}
            <Link href="/docs">REST API</Link>.
          </p>
        </div>

        <p className="auth-footer-link">
          <Link href="/">← Back to calendar</Link>
        </p>
      </div>
    </div>
  );
}
