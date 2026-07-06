"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Copy, Check, Loader2 } from "lucide-react";
import { Topbar } from "@/components/Topbar";
import { Footer } from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { API_V1_ENDPOINTS, DAILY_API_LIMIT, getApiBaseUrl } from "@/lib/apiConstants";

function withApiKey(path: string, apiKey: string) {
  const joiner = path.includes("?") ? "&" : "?";
  return `${path}${joiner}api_key=${apiKey}`;
}

export function ApiDocsClient() {
  const router = useRouter();
  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [usedToday, setUsedToday] = useState(0);
  const [remainingToday, setRemainingToday] = useState(DAILY_API_LIMIT);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  useEffect(() => {
    setBaseUrl(getApiBaseUrl());

    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        router.replace("/login?next=/api-docs");
        return;
      }

      const res = await fetch("/api/user/api-key", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Could not load your API key.");
        setLoading(false);
        return;
      }

      setApiKey(data.apiKey ?? "");
      setUsedToday(data.usedToday ?? 0);
      setRemainingToday(data.remainingToday ?? DAILY_API_LIMIT);
      setLoading(false);
    }

    load();
  }, [router]);

  function copy(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(""), 2000);
  }

  const exampleUrl = apiKey
    ? `${baseUrl}${withApiKey("/activities?limit=10", apiKey)}`
    : "";

  return (
    <>
      <Topbar />
      <div className="docs-page">
        <div className="docs-inner">
          <div className="docs-header">
            <h1>Ham Radio API Portal</h1>
            <p className="section-sub">
              Your personal API key for QSO Dates. Every request must include your key.
              {" "}
              <Link href="/docs">Full documentation</Link>
            </p>
          </div>

          {loading && (
            <p className="section-sub">
              <Loader2 size={16} className="spin" /> Loading your API key…
            </p>
          )}

          {error && <p className="form-error panel">{error}</p>}

          {!loading && !error && apiKey && (
            <>
              <div className="panel docs-key-card">
                <p className="docs-label">Your API key</p>
                <div className="docs-key-row">
                  <code className="no-cap">{apiKey}</code>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => copy(apiKey, "key")}>
                    {copied === "key" ? <Check size={14} /> : <Copy size={14} />}
                    Copy
                  </button>
                </div>
                <p className="hint">
                  Daily limit: {DAILY_API_LIMIT} requests. Used today: {usedToday}. Remaining: {remainingToday}.
                  Resets at midnight UTC.
                </p>
              </div>

              <div className="panel">
                <p className="docs-label">How to authenticate</p>
                <p className="section-sub">Add your key to every API call using one of these methods:</p>
                <ul className="docs-auth-list">
                  <li>Query string: <code className="no-cap">?api_key={apiKey}</code></li>
                  <li>Header: <code className="no-cap">X-API-Key: {apiKey}</code></li>
                  <li>Header: <code className="no-cap">Authorization: Bearer {apiKey}</code></li>
                </ul>
              </div>

              <div className="panel">
                <p className="docs-label">Example request</p>
                <pre className="docs-code no-cap">{exampleUrl}</pre>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => copy(exampleUrl, "url")}>
                  {copied === "url" ? "Copied!" : "Copy URL"}
                </button>
              </div>

              <h2 className="docs-section-title">Endpoints</h2>
              <p className="section-sub">All examples below include your API key.</p>
              <div className="docs-endpoints">
                {API_V1_ENDPOINTS.map((ep) => (
                  <div key={ep.path + ep.urlTemplate} className="panel docs-endpoint">
                    <p><strong>GET</strong> <code className="no-cap">{ep.path}</code></p>
                    <p className="section-sub">{ep.desc}</p>
                    <p className="hint no-cap">{baseUrl}{withApiKey(ep.exampleUrl, apiKey)}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          <p className="auth-footer-link">
            <Link href="/docs">Read API docs</Link> | <Link href="/">Back to calendar</Link>
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
}
