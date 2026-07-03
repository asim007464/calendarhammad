import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageShell } from "@/components/LegalPageShell";
import { CC0_URL } from "@/lib/legalNav";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Terms of Service | QSO Dates",
  description: "Terms of Service for QSODates.com — amateur radio activity calendar and public APIs.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <LegalPageShell title="Terms of Service" effectiveDate="July 4, 2026" currentPath="/terms">
      <p>
        Welcome to QSODates.com. These Terms of Service explain your rights and responsibilities when
        using our website, public APIs, and related services.
      </p>
      <p>
        By creating an account, submitting content, or using any part of QSODates.com, you agree to these
        Terms. If you do not agree, please do not use the service.
      </p>

      <h2>1. About QSODates.com</h2>
      <p>
        QSODates.com is an independent, community-driven platform that provides a worldwide calendar of
        amateur radio activities and public APIs for sharing community-contributed event information.
      </p>

      <h2>2. Eligibility</h2>
      <p>
        You must be at least 13 years old, or the minimum legal age required in your country, to create an
        account. If you are under the age of majority, you may use the service only with permission and
        supervision from a parent or legal guardian.
      </p>

      <h2>3. User Accounts</h2>
      <p>When you create an account, you agree to:</p>
      <ul>
        <li>Provide accurate and current information.</li>
        <li>Keep your password secure.</li>
        <li>Notify us if your account is compromised.</li>
        <li>Accept responsibility for activity that occurs under your account.</li>
      </ul>
      <p>You are responsible for keeping your login credentials confidential.</p>

      <h2>4. User-Submitted Content</h2>
      <p>Registered users may submit event information and other content. You are solely responsible for anything you submit. By submitting content, you confirm that:</p>
      <ul>
        <li>You own the content or have permission to publish it.</li>
        <li>The content does not violate copyright, trademark, privacy, publicity, database, or other legal rights.</li>
        <li>The information is accurate to the best of your knowledge.</li>
        <li>The content complies with applicable laws.</li>
      </ul>

      <h2>5. Open Data and CC0</h2>
      <p>
        One of our goals is to encourage the open sharing of amateur radio event information. Unless
        otherwise specified, event information submitted by users is intended to be released under the{" "}
        <a href={CC0_URL} target="_blank" rel="noopener noreferrer">
          Creative Commons CC0 1.0 Universal Public Domain Dedication
        </a>
        .
      </p>
      <p>
        In plain language, that means event dates, times, locations, and descriptions may be treated as
        public domain information and may be reused by anyone without asking for permission. Photos, logos,
        trademarks, copyrighted documents, and other third-party materials are not automatically included
        unless you own them and clearly have the right to release them.
      </p>
      <p>You should only submit information you have the legal right to publish.</p>

      <h2>6. License to QSODates.com</h2>
      <p>By submitting content, you grant QSODates.com a worldwide, non-exclusive, royalty-free, perpetual, and irrevocable license to:</p>
      <ul>
        <li>Display, store, index, publish, format, archive, and distribute your content through our public APIs.</li>
        <li>Preserve historical versions where appropriate.</li>
      </ul>
      <p>You retain ownership of your original content unless you voluntarily release it under CC0.</p>

      <h2>7. Acceptable Use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Submit false or misleading information.</li>
        <li>Upload malicious software or harmful code.</li>
        <li>Attempt unauthorized access to the website or its systems.</li>
        <li>Interfere with the operation of QSODates.com.</li>
        <li>Spam other users or impersonate another person or organization.</li>
        <li>Submit unlawful, defamatory, abusive, or offensive material.</li>
        <li>Violate applicable laws or regulations.</li>
      </ul>

      <h2>8. Public APIs</h2>
      <p>
        QSODates.com provides free public APIs to encourage innovation within the amateur radio community.
        API access may be rate-limited, modified, suspended, or discontinued at any time without prior notice.
        We may also introduce API versioning, caching guidance, attribution rules, or other technical
        requirements to protect the service and its users.
      </p>
      <p>
        See our <Link href="/api-policy">API Policy</Link> for additional details.
      </p>

      <h2>9. Intellectual Property</h2>
      <p>
        Except for user-submitted content and openly licensed data, all software, website design, graphics,
        branding, source code, and original content on QSODates.com remain the intellectual property of
        QSODates.com or its licensors. QSODates.com, its logo, and associated branding may not be used
        without permission.
      </p>

      <h2>10. Copyright Complaints</h2>
      <p>
        If you believe content on the website infringes your copyright or other legal rights, please{" "}
        <Link href="/contact">contact us</Link> with enough detail for us to review the claim. We may remove
        or disable access to allegedly infringing material while investigating.
      </p>

      <h2>11. Account Suspension and Termination</h2>
      <p>We may suspend or terminate accounts that violate these Terms, submit unlawful content, abuse the website or APIs, interfere with other users, or threaten the security or integrity of QSODates.com.</p>

      <h2>12. Availability of Service</h2>
      <p>
        QSODates.com is provided on a best-effort basis. We do not guarantee uninterrupted availability,
        error-free operation, or permanent storage of submitted content. We may modify, suspend, or
        discontinue any part of the website or APIs at any time.
      </p>

      <h2>13. Disclaimer of Warranties</h2>
      <p>
        QSODates.com is provided &ldquo;as is&rdquo; and &ldquo;as available.&rdquo; We make no warranties,
        express or implied, regarding the accuracy, completeness, reliability, or availability of any
        information on the website. Users should verify event information independently before relying on it.
      </p>

      <h2>14. Limitation of Liability</h2>
      <p>
        To the fullest extent permitted by law, QSODates.com, its owners, administrators, volunteers,
        contributors, and service providers are not liable for any direct, indirect, incidental, consequential,
        or special damages arising from use of the website, public APIs, or user-submitted content.
      </p>

      <h2>15. Indemnification</h2>
      <p>
        You agree to indemnify and hold harmless QSODates.com, its owners, administrators, volunteers,
        contributors, and service providers from any claims, damages, losses, liabilities, costs, or legal
        expenses arising from your submitted content, your use of the website, your violation of these Terms,
        or your infringement of another person&apos;s rights.
      </p>

      <h2>16. Governing Law</h2>
      <p>
        These Terms are governed by the laws of South Carolina, United States, without regard to conflict of
        law principles. Any disputes will be resolved in the competent courts of that jurisdiction.
      </p>

      <h2>17. Changes to These Terms</h2>
      <p>
        We may update these Terms from time to time. The revised version will be published on QSODates.com
        with an updated Effective Date. Your continued use of the service after changes take effect means
        you accept the revised Terms.
      </p>

      <h2>18. Contact</h2>
      <p>
        Questions about these Terms may be directed to the contact information published on our{" "}
        <Link href="/contact">Contact page</Link>.
      </p>
    </LegalPageShell>
  );
}
