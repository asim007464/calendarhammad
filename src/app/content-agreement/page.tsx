import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageShell } from "@/components/LegalPageShell";
import { CC0_URL } from "@/lib/legalNav";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Content Submission Agreement | QSO Dates",
  description: "Content Submission Agreement for contributing amateur radio events to QSODates.com.",
  path: "/content-agreement",
});

export default function ContentAgreementPage() {
  return (
    <LegalPageShell title="Content Submission Agreement" effectiveDate="July 4, 2026" currentPath="/content-agreement">
      <p>
        Thank you for contributing to QSODates.com. This Content Submission Agreement explains your
        responsibilities and the rights you grant when you submit content through our website or services.
      </p>
      <p>
        By submitting content to QSODates.com, you confirm that you have read, understood, and agree to
        this Agreement.
      </p>

      <h2>1. Scope</h2>
      <p>This Agreement applies to all content submitted to QSODates.com, including:</p>
      <ul>
        <li>Event information, descriptions, dates, schedules, and locations.</li>
        <li>Amateur radio callsigns, club or organization information.</li>
        <li>Images, photographs, logos, documents, hyperlinks, and contact information.</li>
        <li>Comments and any other material submitted through the website or APIs.</li>
      </ul>

      <h2>2. Your Responsibility</h2>
      <p>
        You are solely responsible for the content you submit. You agree that all information you provide is
        accurate to the best of your knowledge and that you have the legal right to submit and publish it.
        QSODates.com does not verify the ownership, accuracy, or legality of user-submitted content before
        publication.
      </p>

      <h2>3. Your Promises</h2>
      <p>By submitting content, you represent and warrant that:</p>
      <ul>
        <li>You created the content or have permission from the rights holder to publish it.</li>
        <li>The content does not infringe copyright, trademark, privacy, publicity, database, or other legal rights.</li>
        <li>The content is not false, fraudulent, misleading, defamatory, obscene, or unlawful.</li>
        <li>The content complies with all applicable laws and regulations.</li>
        <li>You have the authority to grant the permissions described in this Agreement.</li>
      </ul>

      <h2>4. License Granted to QSODates.com</h2>
      <p>
        You retain ownership of any intellectual property you own. However, by submitting content, you grant
        QSODates.com a worldwide, perpetual, irrevocable, non-exclusive, royalty-free license to store,
        display, publish, format, archive, index, and distribute your content through our website and public
        APIs, including backups and historical archives.
      </p>

      <h2>5. Open Data Commitment</h2>
      <p>
        QSODates.com supports the open sharing of amateur radio event information. Unless otherwise indicated,
        event information submitted by users is intended to be released under the{" "}
        <a href={CC0_URL} target="_blank" rel="noopener noreferrer">
          Creative Commons CC0 1.0 Universal Public Domain Dedication
        </a>
        .
      </p>
      <p>
        Event dates, times, locations, and descriptions may become public domain information. Photos, logos,
        and copyrighted documents are not included unless you own them and explicitly release them.
      </p>

      <h2>6. Prohibited Submissions</h2>
      <p>You must not submit content that violates any law, infringes intellectual property rights, contains malicious software, is knowingly false or misleading, is defamatory or abusive, promotes illegal activity, contains spam, or violates another person&apos;s privacy.</p>

      <h2>7. Content Review and Removal</h2>
      <p>
        QSODates.com reserves the right, but is not obligated, to review, edit, hide, restrict, or remove any
        submitted content that violates this Agreement, our <Link href="/terms">Terms of Service</Link>,
        applicable law, or creates security risks.
      </p>

      <h2>8. Historical Archives</h2>
      <p>
        To preserve the historical record of amateur radio activities, QSODates.com may retain archived copies
        of event information, including information that has previously been publicly available.
      </p>

      <h2>9. No Compensation</h2>
      <p>All contributions to QSODates.com are voluntary. You will not receive payment, royalties, or licensing fees for content submitted to the website.</p>

      <h2>10. Indemnification</h2>
      <p>
        You agree to indemnify and hold harmless QSODates.com and its contributors from any claims arising from
        your submitted content, your violation of this Agreement, or your infringement of another person&apos;s rights.
      </p>

      <h2>11. No Obligation to Publish</h2>
      <p>Submission of content does not guarantee publication. QSODates.com may decline, delay, edit for formatting, or remove submissions at its sole discretion.</p>

      <h2>12. Acceptance</h2>
      <p>
        By selecting &ldquo;I Agree,&rdquo; submitting content, or using any content submission feature, you confirm that you
        have read this Agreement, understand your responsibilities, agree to the licenses described here, and
        authorize QSODates.com to publish and distribute your submitted content as described.
      </p>
    </LegalPageShell>
  );
}
