import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Sign In | QSO Dates Ham Radio Calendar",
  description: "Sign in to QSO Dates to publish amateur radio activities and manage your ham radio event calendar account.",
  path: "/login",
});

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
