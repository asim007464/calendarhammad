"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Copy, KeyRound, Loader2 } from "lucide-react";
import { Topbar } from "@/components/Topbar";
import { Footer } from "@/components/Footer";
import { DocsCodeBlock } from "@/components/DocsCodeBlock";
import { supabase } from "@/lib/supabase";
import { API_V1_ENDPOINTS, CANONICAL_SITE_URL, DAILY_API_LIMIT, getApiBaseUrl, SITE_NAME, type ApiEndpoint } from "@/lib/apiConstants";

const NAV = [
  { id: "api-key", label: "Your API key" },
  { id: "authentication", label: "Authentication" },
  { id: "base-url", label: "Base URL" },
  { id: "example", label: "Example request" },
  { id: "endpoints", label: "Endpoints" },
];

function withApiKey(path: string, apiKey: string) {
  const joiner = path.includes("?") ? "&" : "?";
  return `${path}${joiner}api_key=${apiKey}`;
}

function exampleFor(ep: ApiEndpoint, baseUrl: string, apiKey: string) {
  if (ep.exampleRequest) {
    return ep.exampleRequest.replaceAll("{{base}}", baseUrl).replaceAll("{{key}}", apiKey);
  }
  return `${baseUrl}${withApiKey(ep.exampleUrl, apiKey)}`;
}

export function ApiDocsClient() {
  const router = useRouter();
  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState(getApiBaseUrl);
  const [loading, setLoading] = useState(true);
  const [usedToday, setUsedToday] = useState(0);
  const [remainingToday, setRemainingToday] = useState(DAILY_API_LIMIT);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const headers: HeadersInit = {};
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          headers.Authorization = `Bearer ${session.access_token}`;
        }

        const res = await fetch("/api/user/api-key", {
          credentials: "include",
          headers,
        });
        const data = await res.json().catch(() => ({}));

        if (cancelled) return;

        if (!res.ok) {
          if (res.status === 401) {
            router.replace("/login?next=/api-docs");
            return;
          }
          setError(typeof data.error === "string" ? data.error : "Could not load your API key.");
          return;
        }

        const key = typeof data.apiKey === "string" ? data.apiKey : "";
        if (!key) {
          setError("No API key was returned. Try refreshing the page or contact support.");
          return;
        }

        setApiKey(key);
        if (typeof data.baseUrl === "string" && data.baseUrl) {
          setBaseUrl(data.baseUrl);
        }
        setUsedToday(data.usedToday ?? 0);
        setRemainingToday(data.remainingToday ?? DAILY_API_LIMIT);
      } catch {
        if (!cancelled) {
          setError("Could not reach the server. Check your connection and try again.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [router]);

  function copyKey() {
    if (!apiKey) return;
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const exampleUrl = apiKey ? `${baseUrl}${withApiKey("/activities?limit=10", apiKey)}` : "";
  const siteHost = CANONICAL_SITE_URL.replace(/^https?:\/\//, "");

  return (
    <>
      <Topbar />
      <div className="docs-page">
        <div className="docs-shell">
          <aside className="docs-sidebar" aria-label="API portal sections">
            <p className="docs-sidebar-title">On this page</p>
            <nav className="docs-sidebar-nav">
              {NAV.map((item) => (
                <a key={item.id} href={`#${item.id}`} className="docs-sidebar-link">
                  {item.label}
                </a>
              ))}
            </nav>
            <div className="docs-sidebar-cta panel">
              <p className="docs-label">Need more detail?</p>
              <Link href="/docs" className="btn btn-outline btn-sm docs-sidebar-btn">
                Full API docs
              </Link>
            </div>
          </aside>

          <main className="docs-main">
            <header className="docs-hero panel" id="overview">
              <p className="docs-eyebrow">Developer portal</p>
              <h1>Ham Radio API Portal</h1>
              <p className="docs-lead">
                Your personal API key for {SITE_NAME}. Register first, then use this key to read events and to
                add or update the same dates, activities, profile, and support messages you can manage on the site.
                Other websites can call <code className="no-cap">{siteHost}</code> and show the details.
              </p>
              <div className="docs-hero-actions">
                <Link href="/docs" className="btn btn-outline btn-sm">Read documentation</Link>
                <Link href="/downloads" className="btn btn-ghost btn-sm">Bulk download</Link>
              </div>
            </header>

            {loading && (
              <div className="panel api-portal-loading">
                <Loader2 size={20} className="spin" aria-hidden />
                <span>Loading your API key…</span>
              </div>
            )}

            {error && <p className="form-error panel">{error}</p>}

            {!loading && !error && apiKey && (
              <>
                <section className="docs-block panel api-portal-key-card" id="api-key">
                  <div className="api-portal-key-head">
                    <div>
                      <p className="docs-label">Your API key</p>
                      <p className="docs-text">Keep this private. It is tied to your account and daily quota.</p>
                    </div>
                    <button type="button" className="btn btn-primary btn-sm" onClick={copyKey}>
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                      {copied ? "Copied" : "Copy key"}
                    </button>
                  </div>
                  <div className="api-portal-key-value">
                    <KeyRound size={18} aria-hidden />
                    <code className="no-cap">{apiKey}</code>
                  </div>
                  <div className="docs-stats api-portal-stats">
                    <div className="docs-stat">
                      <span className="docs-stat-value">{DAILY_API_LIMIT}</span>
                      <span className="docs-stat-label">Daily limit</span>
                    </div>
                    <div className="docs-stat">
                      <span className="docs-stat-value">{usedToday}</span>
                      <span className="docs-stat-label">Used today</span>
                    </div>
                    <div className="docs-stat">
                      <span className="docs-stat-value">{remainingToday}</span>
                      <span className="docs-stat-label">Remaining</span>
                    </div>
                  </div>
                  <p className="docs-note">Quota resets at midnight UTC.</p>
                </section>

                <section className="docs-block panel" id="authentication">
                  <h2>Authentication</h2>
                  <p className="docs-text">Add your key to every API call using one of these methods:</p>
                  <DocsCodeBlock label="Query string" code={`${baseUrl}/activities?limit=10&api_key=${apiKey}`} />
                  <DocsCodeBlock label="Header" code={`X-API-Key: ${apiKey}`} />
                  <DocsCodeBlock label="Bearer token" code={`Authorization: Bearer ${apiKey}`} />
                </section>

                <section className="docs-block panel" id="base-url">
                  <h2>Base URL</h2>
                  <p className="docs-text">
                    Public production endpoint for <strong>{SITE_NAME}</strong> ({siteHost}).
                  </p>
                  <DocsCodeBlock code={baseUrl} />
                </section>

                <section className="docs-block panel" id="example">
                  <h2>Example request</h2>
                  <p className="docs-text">Try this URL in your browser or API client:</p>
                  <DocsCodeBlock code={exampleUrl} />
                </section>

                <section className="docs-block" id="endpoints">
                  <div className="docs-block-head">
                    <h2>Endpoints</h2>
                    <p className="docs-text">Each call uses your API key and the daily limit. Write calls need a verified email.</p>
                  </div>
                  <div className="docs-endpoints">
                    {API_V1_ENDPOINTS.map((ep) => (
                      <article key={`${ep.method}-${ep.path}`} className="panel docs-endpoint-card">
                        <div className="docs-endpoint-top">
                          <span className={`docs-method ${ep.method.toLowerCase()}`}>{ep.method}</span>
                          <code className="docs-path no-cap">{ep.path}</code>
                        </div>
                        <p className="docs-text">{ep.desc}</p>
                        <DocsCodeBlock label="Example" code={exampleFor(ep, baseUrl, apiKey)} />
                      </article>
                    ))}
                  </div>
                </section>
              </>
            )}

            <p className="auth-footer-link">
              <Link href="/docs">Read API docs</Link> | <Link href="/">Back to calendar</Link>
            </p>
          </main>
        </div>
      </div>
      <Footer />
    </>
  );
}
