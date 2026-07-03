import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Create Account | QSO Dates Ham Radio Calendar",
  description:
    "Register for QSO Dates — publish ham radio contests, POTA activations, SOTA events, and special amateur radio activities worldwide.",
  path: "/register",
});

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
