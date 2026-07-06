import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageShell } from "@/components/LegalPageShell";
import { CC0_URL } from "@/lib/legalNav";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Privacy Policy | QSO Dates",
  description: "Privacy Policy for QSODates.com. How we collect, use, and protect your personal information.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <LegalPageShell title="Privacy Policy" effectiveDate="July 4, 2026" currentPath="/privacy">
      <p>
        At QSODates.com, we respect your privacy and are committed to protecting your personal information.
        This Privacy Policy explains what we collect, how we use it, and the choices you have regarding your data.
      </p>
      <p>By using QSODates.com, you agree to the practices described in this Privacy Policy.</p>

      <h2>1. Who We Are</h2>
      <p>
        QSODates.com is an independent, community-driven platform that provides a worldwide calendar of
        amateur radio activities and public APIs for sharing community-contributed event information.
      </p>

      <h2>2. Data Controller</h2>
      <p>
        For the purposes of applicable privacy laws, the data controller is QSODates.com. For privacy
        requests, contact us via the <Link href="/contact">Contact page</Link>.
      </p>

      <h2>3. Information We Collect</h2>
      <p>We collect only the information needed to operate and improve our services.</p>
      <h3>Information You Provide</h3>
      <p>When you create an account or submit content, you may provide:</p>
      <ul>
        <li>Username or display name.</li>
        <li>Email address.</li>
        <li>Amateur radio callsign.</li>
        <li>Password stored only as a secure cryptographic hash.</li>
        <li>Optional profile information.</li>
        <li>Event submissions and messages you send to us.</li>
      </ul>
      <h3>Information Collected Automatically</h3>
      <p>When you use QSODates.com, we may automatically collect:</p>
      <ul>
        <li>IP address, browser type, device information, and operating system.</li>
        <li>Date and time of access, pages visited, and referring website.</li>
        <li>API usage statistics and security or authentication logs.</li>
      </ul>
      <p>This information helps us operate, secure, and improve the website.</p>

      <h2>4. How We Use Information</h2>
      <p>We use your information to:</p>
      <ul>
        <li>Create and manage your account and authenticate users.</li>
        <li>Publish community-contributed event information and operate our public APIs.</li>
        <li>Respond to support requests and improve website functionality.</li>
        <li>Prevent fraud, spam, abuse, and unauthorized access.</li>
        <li>Comply with legal obligations.</li>
      </ul>
      <p>We do not use your personal information for targeted advertising.</p>

      <h2>5. GDPR and International Users</h2>
      <p>
        If you are located in the European Economic Area, the United Kingdom, or another region with similar
        privacy laws, you may have additional rights under local law. Our lawful bases for processing may
        include performance of a contract, legitimate interests, compliance with legal obligations, and
        consent where required.
      </p>
      <p>
        If personal data is transferred internationally, we will take reasonable steps to protect it in
        accordance with applicable law.
      </p>

      <h2>6. Public Information</h2>
      <p>QSODates.com is a public community platform. Information you choose to publish may be publicly visible, including callsign, username, event information, club names, descriptions, and public links. Public event information may also be available through our APIs and may be indexed by search engines.</p>

      <h2>7. Open Data</h2>
      <p>
        Event information submitted by users may be published under the{" "}
        <a href={CC0_URL} target="_blank" rel="noopener noreferrer">
          Creative Commons CC0 1.0 Universal Public Domain Dedication
        </a>
        , where applicable. Once publicly released under CC0, event information may be copied, redistributed,
        archived, or reused by anyone without restriction. This does not apply to your account credentials,
        email address, or other private account information.
      </p>

      <h2>8. Cookies</h2>
      <p>
        QSODates.com uses cookies only where necessary to provide our services, including login authentication,
        session management, security protection, and user preferences. We do not use advertising cookies or
        sell your browsing behavior to advertisers.
      </p>

      <h2>9. Information Sharing</h2>
      <p>We do not sell, rent, or trade your personal information. We may share information only when required by law, necessary to protect security, required to investigate abuse, or with trusted service providers under appropriate confidentiality obligations. Public event information is intentionally shared through our website and public APIs.</p>

      <h2>10. Data Retention</h2>
      <p>
        We retain personal information only as long as necessary to operate your account, provide our services,
        maintain security, meet legal obligations, and preserve historical records where appropriate. Public
        event information released under CC0 may remain publicly available even after an account is deleted.
      </p>

      <h2>11. Account Deletion</h2>
      <p>
        You may request deletion of your account at any time via our <Link href="/contact">Contact page</Link>.
        When an account is deleted, personal account information will be removed or anonymized where practical.
        Security logs may be retained for a limited period. Public event information previously released under
        CC0 may continue to exist in public archives beyond our control.
      </p>

      <h2>12. Your Privacy Rights</h2>
      <p>Depending on your location, you may have the right to access, correct, delete, restrict, or object to processing of your personal information, or request a copy of stored data. Contact us to exercise these rights.</p>

      <h2>13. Security</h2>
      <p>
        We use reasonable technical and organizational measures to protect your information, including encrypted
        password storage, secure authentication, access controls, and system monitoring. No online service can
        guarantee absolute security.
      </p>

      <h2>14. Children&apos;s Privacy</h2>
      <p>
        QSODates.com is not intended for children under the minimum legal age required to create an online
        account in their jurisdiction. We do not knowingly collect personal information from children without
        appropriate authorization.
      </p>

      <h2>15. International Users</h2>
      <p>
        QSODates.com is available worldwide. By using our services, you understand that your information may be
        processed and stored where QSODates.com or its service providers operate, subject to applicable privacy laws.
      </p>

      <h2>16. Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. The updated version will be published on
        QSODates.com with a revised Effective Date. Continued use after changes take effect means you accept
        the revised Privacy Policy.
      </p>

      <h2>17. Contact Us</h2>
      <p>
        Questions about this Privacy Policy or your personal information may be directed via our{" "}
        <Link href="/contact">Contact page</Link>.
      </p>
    </LegalPageShell>
  );
}
