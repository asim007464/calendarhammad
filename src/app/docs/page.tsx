import type { Metadata } from "next";
import Link from "next/link";
import BrandMark from "@/components/BrandMark";
import { API_V1_ENDPOINTS, DAILY_API_LIMIT, getApiBaseUrl } from "@/lib/apiConstants";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Ham Radio Events API Documentation | QSO Dates",
  description:
    "REST API documentation for the QSO Dates amateur radio activity calendar. Fetch ham radio contests, POTA, SOTA, and event data with your API key.",
  path: "/docs",
  keywords: ["ham radio API", "amateur radio REST API", "contest calendar API"],
});

const baseUrl = getApiBaseUrl();

export default function DocsPage() {
  return (
    <div className="docs-page">
      <div className="docs-inner">
        <div className="docs-header">
          <BrandMark link={false} size="auth" />
          <h1>Ham Radio Events API Documentation</h1>
          <p className="section-sub">
            Read-only REST API for amateur radio activity events — contests, POTA, SOTA, DXpeditions, and more.
            Register and get your key from the{" "}
            <Link href="/api-docs">API portal</Link>.
          </p>
        </div>

        <section className="docs-section panel">
          <h2>Authentication</h2>
          <p className="section-sub">Every request must include your API key. Easiest for browser testing:</p>
          <pre className="docs-code no-cap">{`${baseUrl}/search?q=CQ+WW&api_key=qd_your_key_here`}</pre>
          <p className="section-sub">For apps, use headers:</p>
          <pre className="docs-code">{`X-API-Key: qd_your_key_here\n\n# or\n\nAuthorization: Bearer qd_your_key_here`}</pre>
          <p className="hint">Keys start with <code className="no-cap">qd_</code>. Do not use your login JWT as the API key.</p>
        </section>

        <section className="docs-section panel">
          <h2>Base URL</h2>
          <pre className="docs-code no-cap">{baseUrl}</pre>
        </section>

        <section className="docs-section panel">
          <h2>Rate Limits</h2>
          <p className="section-sub">
            {DAILY_API_LIMIT} requests per API key per day. Resets at midnight UTC.
            Headers: <code className="no-cap">X-RateLimit-Limit</code>, <code className="no-cap">X-RateLimit-Remaining</code>, <code className="no-cap">X-RateLimit-Reset</code>.
          </p>
        </section>

        <section className="docs-section">
          <h2>Endpoints</h2>
          <div className="docs-endpoints">
            {API_V1_ENDPOINTS.map((ep) => (
              <div key={ep.urlTemplate} className="panel docs-endpoint">
                <p><strong>{ep.method}</strong> <code className="no-cap">{ep.path}</code></p>
                <p className="section-sub">{ep.desc}</p>
                <p className="hint no-cap">{baseUrl}{ep.exampleUrl}</p>
                {ep.parameters.length > 0 && (
                  <table className="admin-table" style={{ marginTop: 12 }}>
                    <thead><tr><th>Param</th><th>Where</th><th>Description</th></tr></thead>
                    <tbody>
                      {ep.parameters.map((p) => (
                        <tr key={p.name + p.where}>
                          <td className="no-cap">{p.name}</td>
                          <td>{p.where}</td>
                          <td className="no-cap">{p.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="docs-section panel">
          <h2>Example Response</h2>
          <pre className="docs-code no-cap">{`{
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
}`}</pre>
        </section>

        <section className="docs-section panel">
          <h2>Errors</h2>
          <ul className="docs-errors">
            <li><strong>401</strong> — Missing or invalid API key</li>
            <li><strong>403</strong> — Account blocked</li>
            <li><strong>404</strong> — Activity not found</li>
            <li><strong>429</strong> — Daily limit reached</li>
            <li><strong>400</strong> — Bad request (missing query params)</li>
          </ul>
        </section>

        <section className="docs-section panel">
          <h2>Bulk Download (No API Key)</h2>
          <p className="section-sub">
            Export all published activities as JSON or CSV from the{" "}
            <Link href="/downloads">downloads page</Link> — no registration required.
          </p>
        </section>

        <p className="auth-footer-link">
          <Link href="/api-docs">Open API portal</Link> · <Link href="/">Back to calendar</Link>
        </p>
      </div>
    </div>
  );
}
