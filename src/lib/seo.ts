import type { Metadata } from "next";

export const SITE_URL = "https://www.qsodates.com";
export const SITE_NAME = "QSO Dates";

/** Core amateur radio / ham radio terms for search engines */
export const SEO_KEYWORDS = [
  "amateur radio",
  "ham radio",
  "QSO dates",
  "ham radio calendar",
  "amateur radio events",
  "radio contest calendar",
  "ham radio contests",
  "DX contest",
  "POTA",
  "SOTA",
  "field day",
  "special event station",
  "DXpedition",
  "on air activities",
  "ham radio schedule",
  "UTC event calendar",
  "publish ham radio event",
  "amateur radio API",
] as const;

export const DEFAULT_DESCRIPTION =
  "QSO Dates is the worldwide ham radio activity calendar. Find and publish amateur radio contests, POTA and SOTA activations, DXpeditions, field days, nets, and special event stations.";

type PageMeta = {
  title: string;
  description: string;
  path?: string;
  keywords?: string[];
};

export function buildPageMetadata({
  title,
  description,
  path = "",
  keywords = [],
}: PageMeta): Metadata {
  const url = `${SITE_URL}${path}`;
  const allKeywords = [...SEO_KEYWORDS, ...keywords];

  return {
    title,
    description,
    keywords: allKeywords,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export const HOME_JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      description: DEFAULT_DESCRIPTION,
      inLanguage: "en-US",
      potentialAction: {
        "@type": "SearchAction",
        target: `${SITE_URL}/?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "WebApplication",
      "@id": `${SITE_URL}/#app`,
      name: SITE_NAME,
      url: SITE_URL,
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Web",
      description: DEFAULT_DESCRIPTION,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    },
  ],
};
