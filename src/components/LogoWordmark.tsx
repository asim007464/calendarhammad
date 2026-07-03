export type WordmarkSize = "nav" | "auth" | "hero" | "footer";

interface LogoWordmarkProps {
  size?: WordmarkSize;
  className?: string;
}

export function LogoWordmark({ size = "nav", className = "" }: LogoWordmarkProps) {
  return (
    <span
      className={`site-wordmark site-wordmark--${size} ${className}`.trim()}
      aria-hidden="true"
    >
      QSODATES
    </span>
  );
}
