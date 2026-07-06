import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { apiV1PreflightResponse, isApiV1Path } from "@/lib/apiCors";
import { DEFAULT_LOCKDOWN, type LockdownSettings } from "@/lib/siteSettings";

const LOCKDOWN_BYPASS_PREFIXES = [
  "/maintenance",
  "/admin",
  "/login",
  "/register",
  "/forgot-password",
  "/auth/",
  "/api/",
];

function isLockdownBypass(pathname: string) {
  return LOCKDOWN_BYPASS_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p)
  );
}

async function getLockdownEnabled(supabase: ReturnType<typeof createServerClient>): Promise<boolean> {
  try {
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "lockdown")
      .maybeSingle();
    const value = data?.value as LockdownSettings | undefined;
    return Boolean(value?.enabled);
  } catch {
    return DEFAULT_LOCKDOWN.enabled;
  }
}

export async function middleware(request: NextRequest) {
  if (request.method === "OPTIONS" && isApiV1Path(request.nextUrl.pathname)) {
    return apiV1PreflightResponse();
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (!isLockdownBypass(pathname)) {
    const locked = await getLockdownEnabled(supabase);
    if (locked && pathname !== "/maintenance") {
      return NextResponse.redirect(new URL("/maintenance", request.url));
    }
  }

  if (pathname === "/maintenance") {
    const locked = await getLockdownEnabled(supabase);
    if (!locked) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  if ((pathname === "/api-docs" || pathname.startsWith("/api-docs/")) && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
