import Link from "next/link";
import { LogoWordmark, type WordmarkSize } from "@/components/LogoWordmark";

interface BrandMarkProps {
  link?: boolean;
  size?: WordmarkSize;
}

export default function BrandMark({ link = true, size = "nav" }: BrandMarkProps) {
  const mark = <LogoWordmark size={size} />;

  if (link) {
    return (
      <Link href="/" className="brand-mark-link" aria-label="QSO Dates home">
        {mark}
      </Link>
    );
  }

  return mark;
}
