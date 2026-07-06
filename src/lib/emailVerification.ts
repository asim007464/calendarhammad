import type { SupabaseClient } from "@supabase/supabase-js";
import { generateOtpCode, hashOtp, verifyOtp } from "@/lib/otp";
import { findAccountByEmail, EMAIL_RE, OTP_RE, OTP_TTL_MS, OTP_MAX_FAILED_ATTEMPTS } from "@/lib/passwordReset";
import { sendRegistrationOtpEmail } from "@/lib/mail";

export { EMAIL_RE, OTP_RE };

async function getActiveVerificationOtp(supabase: SupabaseClient, email: string) {
  const { data: otpRow, error: otpError } = await supabase
    .from("email_verification_otps")
    .select("id, code_hash, expires_at, used_at, failed_attempts")
    .eq("email", email)
    .is("used_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (otpError) {
    if (otpError.code === "42P01") {
      throw new Error(
        "Email verification is not configured yet. Run the email_verification_otps SQL migration in Supabase."
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

async function recordFailedVerificationAttempt(
  supabase: SupabaseClient,
  otpId: string,
  currentAttempts: number
) {
  await supabase
    .from("email_verification_otps")
    .update({ failed_attempts: currentAttempts + 1 })
    .eq("id", otpId);
}

export async function issueEmailVerificationOtp(
  supabase: SupabaseClient,
  email: string,
  displayName?: string
) {
  const code = generateOtpCode();
  const expiresAt = new Date(Date.now() + OTP_TTL_MS).toISOString();

  await supabase.from("email_verification_otps").delete().eq("email", email);

  const { error: insertError } = await supabase.from("email_verification_otps").insert({
    email,
    code_hash: hashOtp(code, email),
    expires_at: expiresAt,
  });

  if (insertError) {
    console.error("Verification OTP insert error:", insertError);
    throw new Error("Could not create verification code.");
  }

  try {
    await sendRegistrationOtpEmail({
      to: email,
      displayName: displayName || "there",
      code,
    });
  } catch (err) {
    console.error("Registration OTP email error:", err);
    throw err;
  }

  return { ok: true as const };
}

export async function verifyEmailOtpCode(supabase: SupabaseClient, email: string, otp: string) {
  if (!OTP_RE.test(otp)) {
    return { ok: false as const, error: "Enter the 6-digit code from your email." };
  }

  const active = await getActiveVerificationOtp(supabase, email);
  if (!active.ok) return active;

  if (!verifyOtp(otp, email, active.otpRow.code_hash)) {
    const failedAttempts =
      typeof active.otpRow.failed_attempts === "number" ? active.otpRow.failed_attempts : 0;
    await recordFailedVerificationAttempt(supabase, active.otpRow.id, failedAttempts);
    if (failedAttempts + 1 >= OTP_MAX_FAILED_ATTEMPTS) {
      return { ok: false as const, error: "Too many failed attempts. Request a new code." };
    }
    return { ok: false as const, error: "Incorrect code. Please try again." };
  }

  return { ok: true as const, otpRow: active.otpRow };
}

export async function confirmEmailWithOtp(supabase: SupabaseClient, email: string, otp: string) {
  const otpResult = await verifyEmailOtpCode(supabase, email, otp);
  if (!otpResult.ok) return otpResult;

  const account = await findAccountByEmail(supabase, email);
  if (!account) {
    return { ok: false as const, error: "Account not found." };
  }

  const { error: confirmError } = await supabase.auth.admin.updateUserById(account.id, {
    email_confirm: true,
  });

  if (confirmError) {
    console.error("Email confirm error:", confirmError);
    return { ok: false as const, error: "Could not verify email. Try again." };
  }

  await supabase
    .from("email_verification_otps")
    .update({ used_at: new Date().toISOString() })
    .eq("id", otpResult.otpRow.id);

  return { ok: true as const };
}
