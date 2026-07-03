"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Eye, EyeOff } from "lucide-react";
import BrandMark from "@/components/BrandMark";
import Toast, { useToast } from "@/components/Toast";
import { supabase } from "@/lib/supabase";
import { getSafeRedirectPath } from "@/lib/authRedirect";

export default function LoginPage() {
  const router = useRouter();
  const { message, showToast, clear } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [verified, setVerified] = useState(false);
  const [redirectTo, setRedirectTo] = useState("/");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setRedirectTo(getSafeRedirectPath(params.get("next")));
    if (params.get("verified") === "1") {
      setVerified(true);
      showToast("Email verified! You can sign in now.");
    }
  }, [showToast]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setLoading(false);
      setError(authError.message);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_blocked")
        .eq("id", user.id)
        .maybeSingle();

      if (profile?.is_blocked) {
        await supabase.auth.signOut();
        setLoading(false);
        setError("Your account has been blocked. Contact us on WhatsApp.");
        return;
      }
    }

    setLoading(false);
    showToast("Signed in successfully!");
    setTimeout(() => router.push(redirectTo), 800);
  }

  return (
    <>
      <div className="auth-page">
        <div className="auth-card panel">
          <div className="auth-header">
            <BrandMark link={false} size="auth" />
            <h1>Sign In To QSO Dates</h1>
            <p className="section-sub">Manage your ham radio activity calendar</p>
          </div>

          {verified && (
            <p className="auth-notice auth-notice--success">
              Your email is verified. Sign in with your password.
            </p>
          )}

          {error && (
            <p role="alert" className="auth-notice auth-notice--error">{error}</p>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <label className="field">
              <span>Email address</span>
              <input
                name="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="username"
                required
                className="no-cap"
              />
            </label>
            <label className="field">
              <span>Password</span>
              <div className="auth-password-wrap">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className="no-cap"
                />
                <button
                  type="button"
                  className="auth-eye"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p className="auth-forgot">
                <Link href="/forgot-password">Forgot password?</Link>
              </p>
            </label>
            <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
              {loading ? <Loader2 size={15} className="spin" /> : null}
              Sign In
            </button>
          </form>

          <div className="auth-divider"><span>or</span></div>

          <p className="auth-footer-link">
            No account?{" "}
            <Link href={redirectTo === "/" ? "/register" : `/register?next=${encodeURIComponent(redirectTo)}`}>
              Register free
            </Link>
          </p>
          <p className="auth-footer-link" style={{ marginTop: 12 }}>
            <Link href="/">← Back to calendar</Link>
          </p>
        </div>
      </div>
      <Toast message={message} onDone={clear} />
    </>
  );
}
