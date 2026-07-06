import { createAdminClient } from "@/lib/supabase/admin";
import { findAccountByEmail } from "@/lib/passwordReset";
import { enforceRateLimit } from "@/lib/rateLimit";
import { NextResponse } from "next/server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const limited = enforceRateLimit(request, "confirm-email", 10, 15 * 60 * 1000);
    if (limited) return limited;

    const body = await request.json();
    const email = String(body.email ?? "").trim().toLowerCase();

    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }

    const supabase = createAdminClient();
    const account = await findAccountByEmail(supabase, email);

    if (!account) {
      return NextResponse.json({ error: "Account not found." }, { status: 404 });
    }

    const { error } = await supabase.auth.admin.updateUserById(account.id, {
      email_confirm: true,
    });

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Confirm email error:", err);
    const message = err instanceof Error ? err.message : "Could not confirm email.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
