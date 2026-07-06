import Link from "next/link";
import { LogoWordmark, type WordmarkSize, type WordmarkVariant } from "@/components/LogoWordmark";

interface BrandMarkProps {
  link?: boolean;
  size?: WordmarkSize;
  variant?: WordmarkVariant;
}

export default function BrandMark({ link = true, size = "nav", variant = "full" }: BrandMarkProps) {
  const mark = <LogoWordmark size={size} variant={variant} />;

  if (link) {
    return (
      <Link href="/" className="brand-mark-link" aria-label="QSO Dates home">
        {mark}
      </Link>
    );
  }

  return mark;
}
