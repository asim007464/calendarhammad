import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageShell } from "@/components/LegalPageShell";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "API Policy | QSO Dates",
  description: "API Policy for QSODates.com public amateur radio activity APIs.",
  path: "/api-policy",
});

export default function ApiPolicyPage() {
  return (
    <LegalPageShell title="API Policy" effectiveDate="July 4, 2026" currentPath="/api-policy">
      <p>This API Policy applies to all users of the QSODates.com public APIs.</p>

      <h2>1. Access</h2>
      <p>
        API access is provided free of charge unless otherwise stated. We may require authentication for some
        endpoints, and we may change access requirements over time. See the{" "}
        <Link href="/docs">API documentation</Link> and <Link href="/api-docs">API portal</Link> for current
        access details.
      </p>

      <h2>2. Rate Limits</h2>
      <p>
        We may apply rate limits to protect the service, preserve stability, and prevent abuse. Rate limits
        may change at any time.
      </p>

      <h2>3. Acceptable Use</h2>
      <p>You must not use the API to:</p>
      <ul>
        <li>Harass, spam, or abuse users.</li>
        <li>Scrape or copy data in a harmful or disruptive way.</li>
        <li>Circumvent security controls or rate limits.</li>
        <li>Use the API for illegal activity.</li>
        <li>Misrepresent API data as officially verified if it has not been verified.</li>
      </ul>

      <h2>4. Caching and Reuse</h2>
      <p>
        You may cache API responses for reasonable operational use, but you are responsible for keeping cached
        data fresh and accurate where needed. If you reuse public event data, you should respect the CC0 status
        or any other applicable rights notice attached to the content.
      </p>

      <h2>5. Attribution</h2>
      <p>
        Attribution is appreciated where practical, especially in community tools and public displays, but may
        not be required for CC0 data unless a specific dataset or source notice says otherwise.
      </p>

      <h2>6. Versioning</h2>
      <p>
        We may introduce API versions and may retire older versions after a reasonable transition period when
        practical.
      </p>

      <h2>7. Suspension</h2>
      <p>
        We may suspend or restrict API access if we believe a user is violating this policy, abusing the
        service, or creating a security risk.
      </p>

      <h2>8. Changes</h2>
      <p>
        We may update this API Policy from time to time. Continued use of the API after changes take effect
        means you accept the updated policy.
      </p>

      <h2>Contact</h2>
      <p>
        API questions may be directed via our <Link href="/contact">Contact page</Link>.
      </p>
    </LegalPageShell>
  );
}
