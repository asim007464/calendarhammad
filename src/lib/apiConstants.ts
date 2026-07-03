import { getSiteUrl } from "@/lib/siteUrl";

export const CANONICAL_SITE_URL = "https://www.qsodates.com";
export const DAILY_API_LIMIT = Number(process.env.DAILY_API_LIMIT ?? 30);

export interface ApiEndpointParameter {
  name: string;
  where: "path" | "query";
  example: string;
  description: string;
}

export interface ApiEndpoint {
  method: "GET";
  path: string;
  desc: string;
  urlTemplate: string;
  exampleUrl: string;
  parameters: ApiEndpointParameter[];
}

export const API_V1_ENDPOINTS: ApiEndpoint[] = [
  {
    method: "GET",
    path: "/activities",
    desc: "List published ham radio activities with optional filters and pagination.",
    urlTemplate: "/activities?type={type}&country={country}&band={band}&page={page}&limit={limit}",
    exampleUrl: "/activities?type=Contest&country=United+States&page=1&limit=50",
    parameters: [
      { name: "type", where: "query", example: "Contest", description: "Activity type name (optional)" },
      { name: "country", where: "query", example: "United States", description: "Country filter (optional)" },
      { name: "band", where: "query", example: "20m", description: "Band filter (optional)" },
      { name: "page", where: "query", example: "1", description: "Page number (default 1)" },
      { name: "limit", where: "query", example: "50", description: "Results per page (default 50, max 200)" },
    ],
  },
  {
    method: "GET",
    path: "/activity/{id}",
    desc: "Full detail for a single activity by UUID.",
    urlTemplate: "/activity/{id}",
    exampleUrl: "/activity/550e8400-e29b-41d4-a716-446655440000",
    parameters: [
      { name: "id", where: "path", example: "550e8400-e29b-41d4-a716-446655440000", description: "Activity UUID" },
    ],
  },
  {
    method: "GET",
    path: "/search",
    desc: "Search activities by name, callsign, organizer, or description.",
    urlTemplate: "/search?q={query}",
    exampleUrl: "/search?q=CQ+WW",
    parameters: [
      { name: "q", where: "query", example: "CQ WW", description: "Search text (required for text search)" },
      { name: "page", where: "query", example: "1", description: "Page number (optional)" },
      { name: "limit", where: "query", example: "50", description: "Results per page (optional)" },
    ],
  },
  {
    method: "GET",
    path: "/activity-types",
    desc: "List all activity types (Contest, POTA, SOTA, etc.).",
    urlTemplate: "/activity-types",
    exampleUrl: "/activity-types",
    parameters: [],
  },
  {
    method: "GET",
    path: "/schedule",
    desc: "Upcoming activities within a date range.",
    urlTemplate: "/schedule?from={iso_date}&to={iso_date}",
    exampleUrl: "/schedule?from=2026-07-01&to=2026-12-31",
    parameters: [
      { name: "from", where: "query", example: "2026-07-01", description: "Start date ISO (optional)" },
      { name: "to", where: "query", example: "2026-12-31", description: "End date ISO (optional)" },
    ],
  },
];

export function getApiBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (fromEnv) {
    const base = fromEnv.replace(/\/$/, "");
    return base.endsWith("/api/v1") ? base : `${base}/api/v1`;
  }
  const site = getSiteUrl();
  if (site.includes("localhost") || site.includes("127.0.0.1")) {
    return `${site}/api/v1`;
  }
  return `${CANONICAL_SITE_URL}/api/v1`;
}

export function buildFullApiUrl(baseUrl: string, path: string): string {
  const base = baseUrl.replace(/\/$/, "");
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${base}${suffix}`;
}
