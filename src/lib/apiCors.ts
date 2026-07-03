import { NextResponse } from "next/server";

export const API_V1_CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "X-API-Key, Authorization, Content-Type, Accept",
  "Access-Control-Max-Age": "86400",
};

export function isApiV1Path(pathname: string): boolean {
  return pathname.startsWith("/api/v1");
}

export function apiV1PreflightResponse(): NextResponse {
  return new NextResponse(null, { status: 204, headers: API_V1_CORS_HEADERS });
}

export function mergeApiV1CorsHeaders(headers: Record<string, string> = {}): Record<string, string> {
  return { ...API_V1_CORS_HEADERS, ...headers };
}

export function apiV1Json(
  body: unknown,
  init?: { status?: number; headers?: Record<string, string> }
): NextResponse {
  return NextResponse.json(body, {
    status: init?.status,
    headers: mergeApiV1CorsHeaders(init?.headers),
  });
}
