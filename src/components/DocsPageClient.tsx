"use client";

import Link from "next/link";
import { API_V1_ENDPOINTS } from "@/lib/apiConstants";
import { DocsCodeBlock } from "@/components/DocsCodeBlock";

const NAV = [
  { id: "overview", label: "Overview" },
  { id: "authentication", label: "Authentication" },
  { id: "base-url", label: "Base URL" },
  { id: "rate-limits", label: "Rate limits" },
  { id: "endpoints", label: "Endpoints" },
  { id: "example-response", label: "Example response" },
  { id: "errors", label: "Errors" },
  { id: "downloads", label: "Bulk download" },
];

const EXAMPLE_RESPONSE = `{
  "activities": [
    {
      "id": "uuid",
      "name": "CQ WW DX Contest",
      "type": "Contest",
      "callsign": "W1AW",
      "start_at": "2026-10-24T00:00:00Z",
      "end_at": "2026-10-25T23:59:59Z",
      "country": "United States",
      "bands": ["160m", "80m", "40m"],
      "modes": ["SSB", "CW"],
      "website": "https://..."
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 50
}`;

const ERROR_CODES = [
  { code: "401", title: "Unauthorized", desc: "Missing or invalid API key." },
  { code: "403", title: "Forbidden", desc: "Account is blocked." },
  { code: "404", title: "Not found", desc: "Activity does not exist." },
  { code: "429", title: "Too many requests", desc: "Daily API limit reached." },
  { code: "400", title: "Bad request", desc: "Invalid or missing query parameters." },
];

interface Props {
  baseUrl: string;
  dailyLimit: number;
}

export function DocsPageClient({ baseUrl, dailyLimit }: Props) {
  return (
    <div className="docs-page">
      <div className="docs-shell">
        <aside className="docs-sidebar" aria-label="Documentation sections">
          <p className="docs-sidebar-title">On this page</p>
          <nav className="docs-sidebar-nav">
            {NAV.map((item) => (
              <a key={item.id} href={`#${item.id}`} className="docs-sidebar-link">
                {item.label}
              </a>
            ))}
          </nav>
          <div className="docs-sidebar-cta panel">
            <p className="docs-label">Ready to integrate?</p>
            <Link href="/api-docs" className="btn btn-primary btn-sm docs-sidebar-btn">
              Open API portal
            </Link>
          </div>
        </aside>

        <main className="docs-main">
          <header className="docs-hero panel" id="overview">
            <p className="docs-eyebrow">Developer documentation</p>
            <h1>Ham Radio Events API</h1>
            <p className="docs-lead">
              Read-only REST API for amateur radio activity data: contests, POTA, SOTA,
              DXpeditions, nets, and field days. Sign in to get your personal API key.
            </p>
            <div className="docs-hero-actions">
              <Link href="/api-docs" className="btn btn-primary">Get API key</Link>
              <Link href="/downloads" className="btn btn-outline">Bulk download</Link>
            </div>
          </header>

          <section className="docs-block panel" id="authentication">
            <h2>Authentication</h2>
            <p className="docs-text">
              Sign in and open the <Link href="/api-docs">API portal</Link> to copy your key.
              Every request must include it.
            </p>
            <DocsCodeBlock
              label="Query string"
              code={`${baseUrl}/search?q=CQ+WW&api_key=qd_your_key_here`}
            />
            <DocsCodeBlock
              label="Headers"
              code={`X-API-Key: qd_your_key_here\n\nAuthorization: Bearer qd_your_key_here`}
            />
            <p className="docs-note">
              Keys start with <code className="no-cap">qd_</code>. Do not use your login JWT as the API key.
            </p>
          </section>

          <section className="docs-block panel" id="base-url">
            <h2>Base URL</h2>
            <DocsCodeBlock code={baseUrl} />
          </section>

          <section className="docs-block panel" id="rate-limits">
            <h2>Rate limits</h2>
            <div className="docs-stats">
              <div className="docs-stat">
                <span className="docs-stat-value">{dailyLimit}</span>
                <span className="docs-stat-label">Requests per day</span>
              </div>
              <div className="docs-stat">
                <span className="docs-stat-value">UTC</span>
                <span className="docs-stat-label">Resets midnight</span>
              </div>
              <div className="docs-stat">
                <span className="docs-stat-value">1 key</span>
                <span className="docs-stat-label">Per signed-in user</span>
              </div>
            </div>
            <p className="docs-text">
              Response headers include <code className="no-cap">X-RateLimit-Limit</code>,{" "}
              <code className="no-cap">X-RateLimit-Remaining</code>, and{" "}
              <code className="no-cap">X-RateLimit-Reset</code>.
              Requests without a valid key return <strong>401</strong>.
            </p>
          </section>

          <section className="docs-block" id="endpoints">
            <div className="docs-block-head">
              <h2>Endpoints</h2>
              <p className="docs-text">All endpoints are <strong>GET</strong> and require your API key.</p>
            </div>
            <div className="docs-endpoints">
              {API_V1_ENDPOINTS.map((ep) => (
                <article key={ep.urlTemplate} className="panel docs-endpoint-card">
                  <div className="docs-endpoint-top">
                    <span className="docs-method">GET</span>
                    <code className="docs-path no-cap">{ep.path}</code>
                  </div>
                  <p className="docs-text">{ep.desc}</p>
                  <DocsCodeBlock
                    label="Example"
                    code={`${baseUrl}${ep.exampleUrl}${ep.exampleUrl.includes("?") ? "&" : "?"}api_key=qd_your_key_here`}
                  />
                  {ep.parameters.length > 0 && (
                    <div className="docs-params-wrap">
                      <table className="docs-params">
                        <thead>
                          <tr>
                            <th>Parameter</th>
                            <th>Where</th>
                            <th>Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ep.parameters.map((p) => (
                            <tr key={p.name + p.where}>
                              <td><code className="no-cap">{p.name}</code></td>
                              <td>{p.where}</td>
                              <td className="no-cap">{p.description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </article>
              ))}
            </div>
          </section>

          <section className="docs-block panel" id="example-response">
            <h2>Example response</h2>
            <p className="docs-text">Typical JSON from <code className="no-cap">GET /activities</code>:</p>
            <DocsCodeBlock code={EXAMPLE_RESPONSE} />
          </section>

          <section className="docs-block panel" id="errors">
            <h2>Errors</h2>
            <div className="docs-error-grid">
              {ERROR_CODES.map((err) => (
                <div key={err.code} className="docs-error-card">
                  <span className="docs-error-code">{err.code}</span>
                  <strong>{err.title}</strong>
                  <p>{err.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="docs-block panel" id="downloads">
            <h2>Bulk download</h2>
            <p className="docs-text">
              Export all published activities as JSON or CSV from the{" "}
              <Link href="/downloads">downloads page</Link>. No API key required.
            </p>
          </section>
        </main>
      </div>
    </div>
  );
}
