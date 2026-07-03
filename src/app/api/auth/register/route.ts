import { createAdminClient } from "@/lib/supabase/admin";
import { resolveUserRole } from "@/lib/admin";
import { generateApiKey } from "@/lib/apiKey";
import { sendAdminRegistrationNotificationEmail, sendVerificationEmail } from "@/lib/mail";
import { getAuthCallbackUrl, buildEmailVerificationUrl } from "@/lib/siteUrl";
import { enforceRateLimit } from "@/lib/rateLimit";
import { NextResponse } from "next/server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function placeholderCallsign(userId: string) {
  return `U${userId.replace(/-/g, "").slice(0, 11).toUpperCase()}`;
}

export async function POST(request: Request) {
  try {
    const limited = enforceRateLimit(request, "register", 5, 60 * 60 * 1000);
    if (limited) return limited;

    const body = await request.json();
    const displayName = String(body.displayName ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    if (!displayName) {
      return NextResponse.json({ error: "Display name is required." }, { status: 400 });
    }
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    const supabase = createAdminClient();
    const redirectTo = getAuthCallbackUrl();
    const role = resolveUserRole(email);

    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: "signup",
      email,
      password,
      options: {
        redirectTo,
        data: { display_name: displayName },
      },
    });

    if (linkError) {
      const msg = linkError.message.toLowerCase();
      if (msg.includes("already registered") || msg.includes("already been registered")) {
        return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
      }
      throw linkError;
    }

    const userId = linkData.user?.id;
    const hashedToken = linkData.properties?.hashed_token;

    if (!userId || !hashedToken) {
      throw new Error("Failed to generate verification link.");
    }

    const verifyUrl = buildEmailVerificationUrl(hashedToken);

    const callsign = placeholderCallsign(userId);
    const apiKey = generateApiKey();

    await supabase.from("profiles").upsert({
      id: userId,
      name: displayName,
      callsign,
      email,
      role,
      api_key: apiKey,
    });

    await sendVerificationEmail({ to: email, displayName, verifyUrl });

    try {
      const notifyEmail = process.env.NOTIFY_EMAIL ?? process.env.SMTP_EMAIL;
      if (notifyEmail) {
        await sendAdminRegistrationNotificationEmail({
          to: notifyEmail,
          displayName,
          email,
        });
      }
    } catch (emailErr) {
      console.error("Admin registration notification error:", emailErr);
    }

    return NextResponse.json({
      ok: true,
      message: "Verification email sent. Please check your inbox.",
    });
  } catch (err) {
    console.error("Register API error:", err);
    const message = err instanceof Error ? err.message : "Registration failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
