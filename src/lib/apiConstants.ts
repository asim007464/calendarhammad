import { getSiteUrl } from "@/lib/siteUrl";

export const CANONICAL_SITE_URL = "https://www.qsodates.com";
export const SITE_NAME = "QSO Dates";
export const DAILY_API_LIMIT = Number(process.env.DAILY_API_LIMIT ?? 20);

export interface ApiEndpointParameter {
  name: string;
  where: "path" | "query";
  example: string;
  description: string;
}

export interface ApiEndpoint {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  desc: string;
  urlTemplate: string;
  exampleUrl: string;
  parameters: ApiEndpointParameter[];
  /** When set, docs show this request instead of a GET URL. Use {{base}} and {{key}}. */
  exampleRequest?: string;
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
    method: "POST",
    path: "/activity-types",
    desc: "Add an activity type, the same optional type field on the website form. Requires a verified account.",
    urlTemplate: "/activity-types",
    exampleUrl: "/activity-types",
    parameters: [],
    exampleRequest: `POST {{base}}/activity-types
X-API-Key: {{key}}
Content-Type: application/json

{
  "name": "Summits On The Air",
  "color": "#06b6d4"
}`,
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
  {
    method: "POST",
    path: "/activities",
    desc: "Create a date or event with the same fields as Add Activity on the website. Members are submitted for approval. Admins publish immediately.",
    urlTemplate: "/activities",
    exampleUrl: "/activities",
    parameters: [],
    exampleRequest: `POST {{base}}/activities
X-API-Key: {{key}}
Content-Type: application/json

{
  "name": "CQ WW DX Contest",
  "type_name": "Contest",
  "description": "Worldwide DX contest",
  "callsign": "W1AW",
  "organizer": "CQ",
  "start_at": "2026-10-24T00:00:00Z",
  "end_at": "2026-10-25T23:59:59Z",
  "recurrence": "annual",
  "bands": ["20m", "40m"],
  "modes": ["SSB", "CW"],
  "country": "United States",
  "grid": "FN31",
  "website": "https://example.com",
  "notes": "Exchange is CQ zone",
  "custom_fields": { "Exchange": "CQ Zone" },
  "logo_url": "https://example.com/logo.png",
  "image_url": "https://example.com/banner.jpg"
}`,
  },
  {
    method: "GET",
    path: "/activities/{id}",
    desc: "One activity. Published events are visible to any key. Your own pending events include status.",
    urlTemplate: "/activities/{id}",
    exampleUrl: "/activities/550e8400-e29b-41d4-a716-446655440000",
    parameters: [
      { name: "id", where: "path", example: "550e8400-e29b-41d4-a716-446655440000", description: "Activity UUID" },
    ],
  },
  {
    method: "PUT",
    path: "/activities/{id}",
    desc: "Update your own activity. Send only the fields you want to change. Admins can also set status.",
    urlTemplate: "/activities/{id}",
    exampleUrl: "/activities/550e8400-e29b-41d4-a716-446655440000",
    parameters: [
      { name: "id", where: "path", example: "550e8400-e29b-41d4-a716-446655440000", description: "Activity UUID" },
    ],
    exampleRequest: `PUT {{base}}/activities/550e8400-e29b-41d4-a716-446655440000
X-API-Key: {{key}}
Content-Type: application/json

{
  "name": "CQ WW DX Contest",
  "start_at": "2026-10-24T00:00:00Z",
  "country": "United States"
}`,
  },
  {
    method: "DELETE",
    path: "/activities/{id}",
    desc: "Delete your own activity.",
    urlTemplate: "/activities/{id}",
    exampleUrl: "/activities/550e8400-e29b-41d4-a716-446655440000",
    parameters: [
      { name: "id", where: "path", example: "550e8400-e29b-41d4-a716-446655440000", description: "Activity UUID" },
    ],
    exampleRequest: `DELETE {{base}}/activities/550e8400-e29b-41d4-a716-446655440000
X-API-Key: {{key}}`,
  },
  {
    method: "GET",
    path: "/me/activities",
    desc: "List activities you submitted, including ones still waiting for approval.",
    urlTemplate: "/me/activities?status={status}&page={page}&limit={limit}",
    exampleUrl: "/me/activities?status=pending_review",
    parameters: [
      { name: "status", where: "query", example: "pending_review", description: "pending_review, published, or rejected (optional)" },
      { name: "page", where: "query", example: "1", description: "Page number (optional)" },
      { name: "limit", where: "query", example: "50", description: "Results per page (optional)" },
    ],
  },
  {
    method: "GET",
    path: "/me",
    desc: "Your profile and how many API calls you have left today.",
    urlTemplate: "/me",
    exampleUrl: "/me",
    parameters: [],
  },
  {
    method: "PATCH",
    path: "/me",
    desc: "Update your profile: name, callsign, bio, website, and QRZ.",
    urlTemplate: "/me",
    exampleUrl: "/me",
    parameters: [],
    exampleRequest: `PATCH {{base}}/me
X-API-Key: {{key}}
Content-Type: application/json

{
  "name": "Alex Rivera",
  "callsign": "W1AW",
  "bio": "Contest operator",
  "website": "https://example.com",
  "qrz": "https://www.qrz.com/db/W1AW"
}`,
  },
  {
    method: "POST",
    path: "/uploads",
    desc: "Upload an activity image or logo (JPEG, PNG, WebP, or GIF, max 5 MB). Use the returned URL in logo_url or image_url.",
    urlTemplate: "/uploads",
    exampleUrl: "/uploads",
    parameters: [],
    exampleRequest: `POST {{base}}/uploads
X-API-Key: {{key}}
Content-Type: multipart/form-data

file=<image file>`,
  },
  {
    method: "POST",
    path: "/support",
    desc: "Send a support message, the same as the contact form.",
    urlTemplate: "/support",
    exampleUrl: "/support",
    parameters: [],
    exampleRequest: `POST {{base}}/support
X-API-Key: {{key}}
Content-Type: application/json

{
  "subject": "Event listing question",
  "message": "Can you check the times on my submission?"
}`,
  },
  {
    method: "GET",
    path: "/support",
    desc: "List support messages you sent, including any reply.",
    urlTemplate: "/support",
    exampleUrl: "/support",
    parameters: [],
  },
];

export function getApiBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (fromEnv && !/(localhost|127\.0\.0\.1)/i.test(fromEnv)) {
    const base = fromEnv.replace(/\/$/, "");
    return base.endsWith("/api/v1") ? base : `${base}/api/v1`;
  }
  // Always show the public production API URL in docs/portal (not localhost).
  return `${CANONICAL_SITE_URL}/api/v1`;
}

/** Runtime site origin for server callbacks (may be localhost in dev). */
export function getRuntimeSiteUrl(): string {
  return getSiteUrl();
}

export function buildFullApiUrl(baseUrl: string, path: string): string {
  const base = baseUrl.replace(/\/$/, "");
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${base}${suffix}`;
}
