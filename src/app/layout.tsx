import type { Metadata } from "next";
import { DM_Sans, IBM_Plex_Mono, Orbitron } from "next/font/google";
import { AnalyticsScripts } from "@/components/Analytics";
import PwaRegistrar from "@/components/PwaRegistrar";
import { PWA_THEME_COLOR } from "@/app/manifest";
import {
  buildPageMetadata,
  DEFAULT_DESCRIPTION,
  SEO_KEYWORDS,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo";
import "./globals.css";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-sans" });
const ibmMono = IBM_Plex_Mono({ weight: "500", subsets: ["latin"], variable: "--font-mono" });
const orbitron = Orbitron({ weight: ["700", "800", "900"], subsets: ["latin"], variable: "--font-display" });

export const metadata: Metadata = {
  ...buildPageMetadata({
    title: `${SITE_NAME} | Ham Radio Contest & Activity Calendar`,
    description: DEFAULT_DESCRIPTION,
    path: "/",
  }),
  metadataBase: new URL(SITE_URL),
  manifest: "/manifest.webmanifest",
  keywords: [...SEO_KEYWORDS],
  robots: { index: true, follow: true },
  icons: {
    icon: [{ url: "/icon", type: "image/png", sizes: "512x512" }],
    apple: [{ url: "/apple-icon", type: "image/png", sizes: "180x180" }],
    shortcut: [{ url: "/icon", type: "image/png" }],
  },
  appleWebApp: { capable: true, title: "QSO" },
};

export function generateViewport() {
  return { themeColor: PWA_THEME_COLOR };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${ibmMono.variable} ${orbitron.variable}`}>
        <div className="bg-grid" aria-hidden="true" />
        <div className="bg-glow bg-glow-a" aria-hidden="true" />
        <div className="bg-glow bg-glow-b" aria-hidden="true" />
        {children}
        <PwaRegistrar />
        <AnalyticsScripts />
      </body>
    </html>
  );
}
