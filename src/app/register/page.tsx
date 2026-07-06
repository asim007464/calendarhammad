"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2 } from "lucide-react";
import BrandMark from "@/components/BrandMark";
import { PasswordInput, passwordFieldAttrs } from "@/components/PasswordInput";
import { checkPassword } from "@/lib/passwordUtils";
import { getSafeRedirectPath } from "@/lib/authRedirect";

export default function RegisterPage() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [redirectTo, setRedirectTo] = useState("/");

  const pwStrength = checkPassword(password);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setRedirectTo(getSafeRedirectPath(params.get("next")));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!displayName.trim()) return setError("Display name is required.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError("Enter a valid email address.");
    if (!pwStrength.passed) return setError("Password does not meet all requirements.");
    if (password !== confirmPassword) return setError("Passwords do not match.");
    if (!agreeTerms) return setError("You must agree to the terms.");

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: displayName.trim(), email: email.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Registration failed.");
      setSuccess(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Registration failed.";
      if (msg.toLowerCase().includes("already exists")) {
        setError("An account with this email already exists. Try signing in.");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-card panel">
          <div className="auth-done">
            <CheckCircle2 size={40} className="auth-done-icon" />
            <h1>Account Created</h1>
            <p className="section-sub">
              Your account is ready. Sign in with <strong className="no-cap">{email}</strong> and your password.
              {redirectTo !== "/" && " You will return to where you left off."}
            </p>
            <Link
              href={redirectTo === "/" ? "/login" : `/login?next=${encodeURIComponent(redirectTo)}`}
              className="btn btn-primary auth-submit"
            >
              Go to sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card panel">
        <div className="auth-header">
          <BrandMark link={false} size="auth" />
          <h1>Create Your Account</h1>
          <p className="section-sub">Join the QSO Dates activity calendar</p>
        </div>

        {error && <p role="alert" className="auth-notice auth-notice--error">{error}</p>}

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="field">
            <span>Display name</span>
            <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
          </label>
          <label className="field">
            <span>Email address</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="no-cap" />
          </label>
          <PasswordInput
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            visible={showPassword}
            onVisibleChange={setShowPassword}
          >
            {password.length > 0 && (
              <ul className="pw-checks">
                {pwStrength.checks.map((check) => (
                  <li key={check.label} className={check.ok ? "ok" : ""}>{check.ok ? "✓" : "○"} {check.label}</li>
                ))}
              </ul>
            )}
          </PasswordInput>
          <div className="field">
            <label htmlFor="confirm-password">Confirm password</label>
            <input
              id="confirm-password"
              {...passwordFieldAttrs(showPassword)}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="no-cap"
            />
          </div>
          <label className="auth-checkbox">
            <input type="checkbox" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} />
            <span>
              I agree to the{" "}
              <Link href="/terms" target="_blank">Terms of Service</Link>,{" "}
              <Link href="/privacy" target="_blank">Privacy Policy</Link>, and{" "}
              <Link href="/content-agreement" target="_blank">Content Submission Agreement</Link>
            </span>
          </label>
          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? <Loader2 size={15} className="spin" /> : null}
            {loading ? "Creating account…" : "Create account"}
          </button>
          {loading && (
            <p className="auth-hint">Setting up your account. This may take a few seconds.</p>
          )}
        </form>

        <p className="auth-footer-link">
          Already have an account? <Link href={redirectTo === "/" ? "/login" : `/login?next=${encodeURIComponent(redirectTo)}`}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
