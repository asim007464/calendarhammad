import type { SupabaseClient } from "@supabase/supabase-js";
import { verifyOtp } from "@/lib/otp";

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const OTP_RE = /^\d{6}$/;
export const OTP_TTL_MS = 10 * 60 * 1000;
export const OTP_MAX_FAILED_ATTEMPTS = 5;

export type AccountRecord = { id: string; email: string };

export async function findAccountByEmail(
  supabase: SupabaseClient,
  email: string
): Promise<AccountRecord | null> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email")
    .ilike("email", email)
    .maybeSingle();

  if (profile?.id) {
    return { id: profile.id, email: profile.email ?? email };
  }

  const { data: linkData, error } = await supabase.auth.admin.generateLink({
    type: "recovery",
    email,
  });

  if (error || !linkData.user?.id) return null;

  return { id: linkData.user.id, email: linkData.user.email ?? email };
}

export async function getActiveResetOtp(supabase: SupabaseClient, email: string) {
  const { data: otpRow, error: otpError } = await supabase
    .from("password_reset_otps")
    .select("id, code_hash, expires_at, used_at, failed_attempts")
    .eq("email", email)
    .is("used_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (otpError) {
    if (otpError.code === "42P01") {
      throw new Error(
        "Password reset is not configured yet. Run the password_reset_otps SQL migration in Supabase."
      );
    }
    throw otpError;
  }

  if (!otpRow) {
    return { ok: false as const, error: "Invalid or expired code. Request a new one." };
  }

  if (otpRow.used_at || new Date(otpRow.expires_at) < new Date()) {
    return { ok: false as const, error: "This code has expired. Request a new one." };
  }

  const failedAttempts = typeof otpRow.failed_attempts === "number" ? otpRow.failed_attempts : 0;
  if (failedAttempts >= OTP_MAX_FAILED_ATTEMPTS) {
    return { ok: false as const, error: "Too many failed attempts. Request a new code." };
  }

  return { ok: true as const, otpRow };
}

async function recordFailedOtpAttempt(supabase: SupabaseClient, otpId: string, currentAttempts: number) {
  await supabase
    .from("password_reset_otps")
    .update({ failed_attempts: currentAttempts + 1 })
    .eq("id", otpId);
}

export async function verifyResetOtpCode(
  supabase: SupabaseClient,
  email: string,
  otp: string
) {
  if (!OTP_RE.test(otp)) {
    return { ok: false as const, error: "Enter the 6-digit code from your email." };
  }

  const active = await getActiveResetOtp(supabase, email);
  if (!active.ok) return active;

  if (!verifyOtp(otp, email, active.otpRow.code_hash)) {
    const failedAttempts =
      typeof active.otpRow.failed_attempts === "number" ? active.otpRow.failed_attempts : 0;
    await recordFailedOtpAttempt(supabase, active.otpRow.id, failedAttempts);
    if (failedAttempts + 1 >= OTP_MAX_FAILED_ATTEMPTS) {
      return { ok: false as const, error: "Too many failed attempts. Request a new code." };
    }
    return { ok: false as const, error: "Incorrect code. Please try again." };
  }

  return { ok: true as const, otpRow: active.otpRow };
}
