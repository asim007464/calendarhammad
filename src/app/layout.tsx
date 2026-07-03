import type { Metadata } from "next";
import { DM_Sans, IBM_Plex_Mono } from "next/font/google";
import { AnalyticsScripts } from "@/components/Analytics";
import "./globals.css";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-sans" });
const ibmMono = IBM_Plex_Mono({ weight: "500", subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "QSO Dates — Amateur Radio Activity Calendar",
  description:
    "Discover and publish amateur radio activities — contests, special events, POTA, SOTA, DXpeditions and more. www.qsodates.com",
  metadataBase: new URL("https://www.qsodates.com"),
  openGraph: {
    title: "QSO Dates",
    description: "Your worldwide hub for on-air amateur radio activities",
    url: "https://www.qsodates.com",
    siteName: "QSO Dates",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${ibmMono.variable}`}>
        <div className="bg-grid" aria-hidden="true" />
        <div className="bg-glow bg-glow-a" aria-hidden="true" />
        <div className="bg-glow bg-glow-b" aria-hidden="true" />
        {children}
        <AnalyticsScripts />
      </body>
    </html>
  );
}
