import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthCallbackUrl } from "@/lib/siteUrl";
import { sendVerificationEmail } from "@/lib/mail";
import { enforceRateLimit } from "@/lib/rateLimit";
import { NextResponse } from "next/server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const limited = enforceRateLimit(request, "resend-verify", 3, 60 * 60 * 1000);
    if (limited) return limited;

    const body = await request.json();
    const email = String(body.email ?? "").trim().toLowerCase();

    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) throw listError;

    const user = users.users.find((u) => u.email?.toLowerCase() === email);
    if (!user) {
      return NextResponse.json({ ok: true, message: "If that account exists, a new verification email was sent." });
    }

    if (user.email_confirmed_at) {
      return NextResponse.json({ error: "This email is already verified. You can sign in." }, { status: 400 });
    }

    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: { redirectTo: getAuthCallbackUrl() },
    });

    if (linkError) throw linkError;

    const hashedToken = linkData.properties?.hashed_token;
    if (!hashedToken) throw new Error("Failed to generate verification link.");

    const params = new URLSearchParams({
      token_hash: hashedToken,
      type: "magiclink",
    });
    const verifyUrl = `${getAuthCallbackUrl()}?${params.toString()}`;

    const { data: profile } = await supabase
      .from("profiles")
      .select("name")
      .eq("id", user.id)
      .maybeSingle();

    const displayName =
      (user.user_metadata?.display_name as string | undefined) || profile?.name || "there";

    await sendVerificationEmail({ to: email, displayName, verifyUrl });

    return NextResponse.json({ ok: true, message: "Verification email sent." });
  } catch (err) {
    console.error("Resend verification error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not send verification email." },
      { status: 500 }
    );
  }
}
