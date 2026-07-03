export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");

  const vercelProd = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercelProd) {
    const host = vercelProd.replace(/^https?:\/\//, "");
    return `https://${host}`;
  }

  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl) {
    const host = vercelUrl.replace(/^https?:\/\//, "");
    return `https://${host}`;
  }

  return "http://localhost:3000";
}

export function getAuthCallbackUrl(): string {
  return `${getSiteUrl()}/auth/callback`;
}

/** Direct app callback — avoids PKCE failures from admin generateLink action_link */
export function buildEmailVerificationUrl(hashedToken: string): string {
  const params = new URLSearchParams({
    token_hash: hashedToken,
    type: "signup",
  });
  return `${getAuthCallbackUrl()}?${params.toString()}`;
}
