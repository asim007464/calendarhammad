export type WordmarkSize = "nav" | "auth" | "hero" | "footer";
export type WordmarkVariant = "full" | "qso";

interface LogoWordmarkProps {
  size?: WordmarkSize;
  variant?: WordmarkVariant;
  className?: string;
}

export function LogoWordmark({ size = "nav", variant = "full", className = "" }: LogoWordmarkProps) {
  const label = variant === "qso" ? "QSO" : "QSODATES";

  return (
    <span
      className={`site-wordmark site-wordmark--${size}${variant === "qso" ? " site-wordmark--qso" : ""} ${className}`.trim()}
      aria-hidden="true"
    >
      {label}
    </span>
  );
}
