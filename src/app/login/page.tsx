"use client";



import { useEffect, useState } from "react";

import Link from "next/link";

import { useRouter } from "next/navigation";

import { Loader2 } from "lucide-react";

import BrandMark from "@/components/BrandMark";

import { PasswordInput } from "@/components/PasswordInput";

import Toast, { useToast } from "@/components/Toast";

import { supabase } from "@/lib/supabase";

import { getSafeRedirectPath } from "@/lib/authRedirect";

import { formatAuthError } from "@/lib/authErrors";



export default function LoginPage() {

  const router = useRouter();

  const { message, showToast, clear } = useToast();

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [verified, setVerified] = useState(false);

  const [redirectTo, setRedirectTo] = useState("/");

  const [needsVerification, setNeedsVerification] = useState(false);

  const [pendingEmail, setPendingEmail] = useState("");

  const [resending, setResending] = useState(false);



  useEffect(() => {

    const params = new URLSearchParams(window.location.search);

    setRedirectTo(getSafeRedirectPath(params.get("next")));

    if (params.get("verified") === "1") {

      setVerified(true);

      showToast("Email verified! You can sign in now.");

    }

  }, [showToast]);



  async function handleResendVerification() {

    if (!pendingEmail) return;

    setResending(true);

    setError("");

    try {

      const res = await fetch("/api/auth/resend-verification", {

        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({ email: pendingEmail }),

      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? "Could not send email.");

      showToast("Verification email sent. Check your inbox.");

    } catch (err) {

      setError(err instanceof Error ? err.message : "Could not send verification email.");

    } finally {

      setResending(false);

    }

  }



  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {

    e.preventDefault();

    setLoading(true);

    setError("");

    setNeedsVerification(false);



    const form = new FormData(e.currentTarget);

    const email = String(form.get("email") ?? "").trim();

    const password = String(form.get("password") ?? "");

    setPendingEmail(email);



    try {

      let { error: authError } = await supabase.auth.signInWithPassword({ email, password });



      if (authError) {

        const formatted = formatAuthError(authError.message);

        if (formatted.needsVerification) {

          const confirmRes = await fetch("/api/auth/confirm-email", {

            method: "POST",

            headers: { "Content-Type": "application/json" },

            body: JSON.stringify({ email }),

          });

          if (confirmRes.ok) {

            const retry = await supabase.auth.signInWithPassword({ email, password });

            authError = retry.error;

          }

        }

        if (authError) {

          const retryFormatted = formatAuthError(authError.message);

          setError(retryFormatted.error);

          setNeedsVerification(Boolean(retryFormatted.needsVerification));

          return;

        }

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

          setError("Your account has been blocked. Contact us for help.");

          return;

        }

      }



      showToast("Signed in successfully!");

      router.refresh();

      window.setTimeout(() => {

        router.push(redirectTo);

      }, 400);

    } catch {

      setError("Could not sign in. Check your connection and try again.");

    } finally {

      setLoading(false);

    }

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



          {needsVerification && (

            <button

              type="button"

              className="btn btn-outline btn-sm auth-submit"

              onClick={handleResendVerification}

              disabled={resending}

            >

              {resending ? "Sending…" : "Resend verification email"}

            </button>

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

                defaultValue={pendingEmail}

              />

            </label>

            <PasswordInput
              label="Password"
              name="password"
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />

            <p className="auth-forgot">

              <Link href="/forgot-password">Forgot password?</Link>

            </p>

            <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>

              {loading ? <Loader2 size={15} className="spin" /> : null}

              {loading ? "Signing in…" : "Sign In"}

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

