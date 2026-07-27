import Image from "next/image";
import Link from "next/link";
import type { WordmarkSize } from "@/components/LogoWordmark";

interface BrandMarkProps {
  link?: boolean;
  size?: WordmarkSize;
}

const LOGO_SIZES: Record<WordmarkSize, { width: number; height: number }> = {
  nav: { width: 420, height: 120 },
  auth: { width: 510, height: 144 },
  hero: { width: 680, height: 192 },
  footer: { width: 510, height: 144 },
};

export default function BrandMark({ link = true, size = "nav" }: BrandMarkProps) {
  const dims = LOGO_SIZES[size];
  const mark = (
    <span className={`site-logo-wrap site-logo-wrap--${size}`}>
      <Image
        src="/qso-dates-wordmark.png"
        alt="QSO Dates"
        width={dims.width}
        height={dims.height}
        className={`site-logo-img site-logo-img--${size}`}
        priority={size === "nav"}
      />
    </span>
  );

  if (link) {
    return (
      <Link href="/" className="brand-mark-link" aria-label="QSO Dates home">
        {mark}
      </Link>
    );
  }

  return mark;
}
