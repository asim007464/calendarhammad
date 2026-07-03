"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Copy, Check, Loader2 } from "lucide-react";
import BrandMark from "@/components/BrandMark";
import { supabase } from "@/lib/supabase";
import { API_V1_ENDPOINTS, DAILY_API_LIMIT, getApiBaseUrl } from "@/lib/apiConstants";

export default function ApiDocsPage() {
  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [copied, setCopied] = useState("");

  useEffect(() => {
    setBaseUrl(getApiBaseUrl());
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      setLoggedIn(!!session);
      if (session?.access_token) {
        const res = await fetch("/api/user/api-key", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setApiKey(data.apiKey ?? "");
        }
      }
      setLoading(false);
    }
    load();
  }, []);

  function copy(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(""), 2000);
  }

  const exampleUrl = apiKey
    ? `${baseUrl}/activities?limit=10&api_key=${apiKey}`
    : `${baseUrl}/activities?limit=10&api_key=qd_your_key_here`;

  return (
    <div className="docs-page">
      <div className="docs-inner">
        <div className="docs-header">
          <BrandMark link={false} size="auth" />
          <h1>Ham Radio API Portal</h1>
          <p className="section-sub">
            Your personal API key for fetching QSO Dates amateur radio activity data.{" "}
            <Link href="/docs">Full documentation →</Link>
          </p>
        </div>

        {!loggedIn && !loading && (
          <div className="panel docs-alert">
            <p><Link href="/login?next=/api-docs">Sign in</Link> or <Link href="/register">register</Link> to get your API key.</p>
          </div>
        )}

        {loading && <p className="section-sub"><Loader2 size={16} className="spin" /> Loading…</p>}

        {loggedIn && apiKey && (
          <div className="panel docs-key-card">
            <p className="docs-label">Your API key</p>
            <div className="docs-key-row">
              <code className="no-cap">{apiKey}</code>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => copy(apiKey, "key")}>
                {copied === "key" ? <Check size={14} /> : <Copy size={14} />}
                Copy
              </button>
            </div>
            <p className="hint">Daily limit: {DAILY_API_LIMIT} requests · Resets midnight UTC</p>
          </div>
        )}

        <div className="panel">
          <p className="docs-label">Example request</p>
          <pre className="docs-code no-cap">{exampleUrl}</pre>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => copy(exampleUrl, "url")}>
            {copied === "url" ? "Copied!" : "Copy URL"}
          </button>
        </div>

        <h2 className="docs-section-title">Endpoints</h2>
        <div className="docs-endpoints">
          {API_V1_ENDPOINTS.map((ep) => (
            <div key={ep.path + ep.urlTemplate} className="panel docs-endpoint">
              <p><strong>GET</strong> <code className="no-cap">{ep.path}</code></p>
              <p className="section-sub">{ep.desc}</p>
              <p className="hint no-cap">{baseUrl}{ep.exampleUrl}</p>
            </div>
          ))}
        </div>

        <p className="auth-footer-link">
          <Link href="/downloads">Download bulk data (no API key)</Link> · <Link href="/">Back to calendar</Link>
        </p>
      </div>
    </div>
  );
}
