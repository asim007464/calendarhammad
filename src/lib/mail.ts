import nodemailer from "nodemailer";
import { getSiteUrl } from "@/lib/siteUrl";

function getAuthTransporter() {
  const user = process.env.SMTP_EMAIL;
  const pass = (process.env.SMTP_APP_PASSWORD ?? process.env.SMTP_PASSWORD)?.replace(/\s/g, "");

  if (!user || !pass) {
    throw new Error("SMTP_EMAIL and SMTP_APP_PASSWORD must be set.");
  }

  return nodemailer.createTransport({ service: "gmail", auth: { user, pass } });
}

// Don't show raw SMTP errors to users.
export function toMailUserError(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err);
  const lower = message.toLowerCase();

  if (lower.includes("smtp_email") && lower.includes("must be set")) {
    return "Email is not configured on the server. Please try again later or contact support.";
  }
  if (
    lower.includes("535") ||
    lower.includes("badcredentials") ||
    lower.includes("username and password not accepted") ||
    lower.includes("invalid login")
  ) {
    return "We could not send the verification email right now. Please try again later or contact support.";
  }

  return "We could not send the verification email. Please try again later.";
}

function emailShell(title: string, bodyHtml: string) {
  return `
    <div style="font-family:DM Sans,system-ui,sans-serif;max-width:520px;margin:0 auto;color:#f0ffd6">
      <div style="background:#c6ff34;color:#0a0c08;padding:20px 24px;border-radius:12px 12px 0 0">
        <strong style="font-size:18px;letter-spacing:0.05em">${title}</strong>
      </div>
      <div style="background:#121408;border:1px solid rgba(198,255,52,0.15);border-top:none;padding:28px 24px;border-radius:0 0 12px 12px">
        ${bodyHtml}
      </div>
    </div>
  `;
}

export async function sendVerificationEmail({
  to,
  displayName,
  verifyUrl,
}: {
  to: string;
  displayName: string;
  verifyUrl: string;
}) {
  const from = process.env.SMTP_EMAIL!.trim();
  const transporter = getAuthTransporter();

  await transporter.sendMail({
    from: `"QSO Dates" <${from}>`,
    to,
    subject: "Verify your QSO Dates account",
    text: [
      `Hi ${displayName},`,
      "",
      "Thanks for registering on QSO Dates.",
      "Please verify your email address by opening this link:",
      verifyUrl,
      "",
      "If you did not create this account, you can ignore this email.",
      "",
      "73,",
      "The QSO Dates team",
    ].join("\n"),
    html: emailShell(
      "QSO Dates",
      `
        <p style="margin:0 0 16px">Hi <strong>${displayName}</strong>,</p>
        <p style="margin:0 0 20px;color:rgba(198,255,52,0.75);line-height:1.6">
          Thanks for registering. Please verify your email to activate your account and manage ham radio activities.
        </p>
        <a href="${verifyUrl}" style="display:inline-block;background:#c6ff34;color:#0a0c08;text-decoration:none;padding:12px 22px;border-radius:8px;font-weight:600">
          Verify email address
        </a>
        <p style="margin:24px 0 0;font-size:13px;color:rgba(198,255,52,0.45);line-height:1.5">
          Or copy this link:<br/>
          <a href="${verifyUrl}" style="color:#c6ff34;word-break:break-all">${verifyUrl}</a>
        </p>
      `
    ),
  });
}

export async function sendRegistrationOtpEmail({
  to,
  displayName,
  code,
}: {
  to: string;
  displayName: string;
  code: string;
}) {
  const from = process.env.SMTP_EMAIL!.trim();
  const transporter = getAuthTransporter();

  await transporter.sendMail({
    from: `"QSO Dates" <${from}>`,
    to,
    subject: "Verify your QSO Dates account",
    text: [
      `Hi ${displayName},`,
      "",
      "Thanks for registering on QSO Dates.",
      "",
      `Your verification code is: ${code}`,
      "",
      "Enter this 6-digit code on the website to complete your registration.",
      "This code expires in 10 minutes.",
      "",
      "If you did not create this account, you can ignore this email.",
    ].join("\n"),
    html: emailShell(
      "QSO Dates",
      `
        <p style="margin:0 0 12px">Hi <strong>${displayName}</strong>,</p>
        <p style="margin:0 0 8px;color:rgba(198,255,52,0.75)">Enter this code to verify your email:</p>
        <p style="margin:0 0 20px;font-size:32px;font-weight:700;letter-spacing:0.3em;font-family:monospace;color:#c6ff34">${code}</p>
        <p style="margin:0;font-size:13px;color:rgba(198,255,52,0.45)">This code expires in 10 minutes.</p>
      `
    ),
  });
}

export async function sendPasswordResetOtpEmail({ to, code }: { to: string; code: string }) {
  const from = process.env.SMTP_EMAIL!.trim();
  const transporter = getAuthTransporter();

  await transporter.sendMail({
    from: `"QSO Dates" <${from}>`,
    to,
    subject: "Your QSO Dates password reset code",
    text: [
      "You requested a password reset for your QSO Dates account.",
      "",
      `Your verification code is: ${code}`,
      "",
      "This code expires in 10 minutes.",
      "",
      "If you did not request this, you can ignore this email.",
    ].join("\n"),
    html: emailShell(
      "QSO Dates",
      `
        <p style="margin:0 0 12px">You requested a password reset.</p>
        <p style="margin:0 0 8px;color:rgba(198,255,52,0.75)">Enter this 6-digit code:</p>
        <p style="margin:0 0 20px;font-size:32px;font-weight:700;letter-spacing:0.3em;font-family:monospace;color:#c6ff34">${code}</p>
        <p style="margin:0;font-size:13px;color:rgba(198,255,52,0.45)">This code expires in 10 minutes.</p>
      `
    ),
  });
}

export async function sendAdminSupportNotificationEmail({
  to,
  userName,
  email,
  subject,
  message,
}: {
  to: string;
  userName: string;
  email: string;
  subject: string;
  message: string;
}) {
  const from = process.env.SMTP_EMAIL!.trim();
  const transporter = getAuthTransporter();
  const adminHref = `${getSiteUrl()}/admin/support`;

  await transporter.sendMail({
    from: `"QSO Dates" <${from}>`,
    to,
    subject: `Support: ${subject}`,
    text: [
      "New support message on QSO Dates.",
      "",
      `From: ${userName}`,
      email ? `Email: ${email}` : "",
      `Subject: ${subject}`,
      "",
      message,
      "",
      `Open inbox: ${adminHref}`,
    ]
      .filter(Boolean)
      .join("\n"),
    html: emailShell(
      "QSO Dates: Support",
      `
        <p style="margin:0 0 8px"><strong>${userName}</strong>${email ? `, ${email}` : ""}</p>
        <p style="margin:0 0 12px;color:rgba(198,255,52,0.75)">${subject}</p>
        <p style="margin:0 0 20px;white-space:pre-wrap;line-height:1.6">${message}</p>
        <a href="${adminHref}" style="display:inline-block;background:#c6ff34;color:#0a0c08;text-decoration:none;padding:12px 22px;border-radius:8px;font-weight:600">
          Open support inbox
        </a>
      `,
    ),
  });
}

export async function sendAdminRegistrationNotificationEmail({
  to,
  displayName,
  email,
}: {
  to: string;
  displayName: string;
  email: string;
}) {
  const from = process.env.SMTP_EMAIL!.trim();
  const transporter = getAuthTransporter();
  const adminHref = `${getSiteUrl()}/admin/users`;

  await transporter.sendMail({
    from: `"QSO Dates" <${from}>`,
    to,
    subject: `New user registered: ${displayName}`,
    text: [
      "A new user registered on QSO Dates.",
      "",
      `Name: ${displayName}`,
      `Email: ${email}`,
      "",
      `Review in admin: ${adminHref}`,
    ].join("\n"),
    html: emailShell(
      "QSO Dates: New user",
      `
        <p style="margin:0 0 12px"><strong>${displayName}</strong></p>
        <p style="margin:0 0 16px;color:rgba(198,255,52,0.75)">Email: ${email}</p>
        <a href="${adminHref}" style="display:inline-block;background:#c6ff34;color:#0a0c08;text-decoration:none;padding:12px 22px;border-radius:8px;font-weight:600">
          Open admin users
        </a>
      `
    ),
  });
}
