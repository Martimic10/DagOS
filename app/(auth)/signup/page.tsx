"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export default function SignupPage() {
  const router = useRouter();

  const [firstName, setFirstName]         = useState("");
  const [email, setEmail]                 = useState("");
  const [password, setPassword]           = useState("");
  const [loading, setLoading]             = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError]                 = useState<string | null>(null);
  const [emailSent, setEmailSent]         = useState(false);

  const handleGoogleSignUp = useCallback(async () => {
    setGoogleLoading(true);
    setError(null);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent("/auth/desktop-handoff")}`,
      },
    });
    if (authError) {
      setError(authError.message);
      setGoogleLoading(false);
    }
  }, []);

  const handleSignUp = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError(null);

      const supabase    = createClient();
      const trimmedName = firstName.trim().split(/\s+/)[0];

      const { data, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { first_name: trimmedName },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent("/auth/desktop-handoff")}`,
        },
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        await supabase.from("user_profiles").upsert({
          id: data.user.id,
          first_name: trimmedName,
          email: email.trim(),
        });
      }

      if (data.session) {
        router.push("/auth/desktop-handoff");
        router.refresh();
      } else {
        setEmailSent(true);
        setLoading(false);
      }
    },
    [firstName, email, password, router]
  );

  // ── Email confirmation sent ───────────────────────────────────────────────────
  if (emailSent) {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center px-4 bg-[#050508]">
        <div className="fixed inset-0 -z-10 pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:48px_48px]" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.18)_0%,transparent_60%)] blur-3xl" />
        </div>
        <div className="w-full max-w-sm text-center">
          <div className="mb-5 flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-emerald-800/50 bg-emerald-950/40">
              <CheckCircle2 className="h-7 w-7 text-emerald-500" />
            </div>
          </div>
          <h2 className="font-mono text-xl font-bold text-zinc-100">Check your email</h2>
          <p className="mt-2.5 font-mono text-sm text-zinc-500 leading-relaxed">
            We sent a confirmation link to{" "}
            <span className="text-zinc-300">{email}</span>.
            <br />Open it to activate your account.
          </p>
          <p className="mt-7 font-mono text-xs text-zinc-700">
            Already confirmed?{" "}
            <Link
              href="/login"
              className="text-zinc-500 underline underline-offset-2 hover:text-zinc-200 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    );
  }

  // ── Signup form ───────────────────────────────────────────────────────────────
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 bg-[#050508] overflow-hidden">

      {/* Background — matches landing page */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:48px_48px]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.18)_0%,transparent_60%)] blur-3xl" />
      </div>

      <div className="w-full max-w-sm">

        {/* Logo */}
        <Link href="/" className="mb-8 flex flex-col items-center gap-3 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900 group-hover:border-zinc-600 transition-colors">
            <div className="h-3.5 w-3.5 rounded-sm bg-zinc-100" />
          </div>
          <div className="text-center">
            <p className="font-mono text-base font-bold uppercase tracking-widest text-zinc-100">
              DagOS
            </p>
            <p className="mt-0.5 font-mono text-xs text-zinc-600">
              Create your account — it&apos;s free
            </p>
          </div>
        </Link>

        {/* Card */}
        <div className="overflow-hidden rounded-2xl border border-zinc-800/70 bg-zinc-950/60 backdrop-blur-sm">

          {/* Google */}
          <div className="px-6 pt-6 pb-5">
            <Button
              type="button"
              variant="ghost"
              onClick={handleGoogleSignUp}
              disabled={googleLoading || loading}
              className="w-full h-10 gap-3 border border-zinc-700/80 bg-zinc-900/60 font-mono text-sm text-zinc-300 hover:bg-zinc-800/60 hover:border-zinc-600 hover:text-zinc-100 transition-all disabled:opacity-50"
            >
              {googleLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <GoogleIcon />
              )}
              Continue with Google
            </Button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 px-6 pb-5">
            <div className="h-px flex-1 bg-zinc-800/60" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-700">
              or
            </span>
            <div className="h-px flex-1 bg-zinc-800/60" />
          </div>

          {/* Email form */}
          <form onSubmit={handleSignUp}>
            <div className="border-t border-zinc-800/60 px-6 py-4">
              <label className="block">
                <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-zinc-600">
                  First Name
                </span>
                <Input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Michael"
                  required
                  autoComplete="given-name"
                  autoFocus
                  className="h-9 border-zinc-800 bg-zinc-900/60 font-mono text-sm text-zinc-300 placeholder:text-zinc-700 focus-visible:border-zinc-600 focus-visible:ring-0"
                />
              </label>
            </div>

            <div className="px-6 pb-4">
              <label className="block">
                <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-zinc-600">
                  Email
                </span>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  className="h-9 border-zinc-800 bg-zinc-900/60 font-mono text-sm text-zinc-300 placeholder:text-zinc-700 focus-visible:border-zinc-600 focus-visible:ring-0"
                />
              </label>
            </div>

            <div className="px-6 pb-4">
              <label className="block">
                <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-zinc-600">
                  Password
                </span>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="h-9 border-zinc-800 bg-zinc-900/60 font-mono text-sm text-zinc-300 placeholder:text-zinc-700 focus-visible:border-zinc-600 focus-visible:ring-0"
                />
              </label>
              <p className="mt-1.5 font-mono text-[10px] text-zinc-700">Minimum 8 characters</p>
            </div>

            {error && (
              <div className="mx-6 mb-4 rounded-lg border border-red-900/40 bg-red-950/30 px-3 py-2.5">
                <p className="font-mono text-[11px] text-red-400/90">{error}</p>
              </div>
            )}

            <div className="border-t border-zinc-800/60 px-6 py-4">
              <Button
                type="submit"
                disabled={loading || googleLoading}
                className="w-full h-10 gap-2 bg-white font-mono text-sm text-zinc-950 hover:bg-zinc-100 transition-all shadow-lg shadow-white/5 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <ArrowRight className="h-3.5 w-3.5" />
                )}
                {loading ? "Creating account…" : "Create Account"}
              </Button>
            </div>
          </form>
        </div>

        {/* Switch */}
        <p className="mt-5 text-center font-mono text-xs text-zinc-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-zinc-400 underline underline-offset-2 transition-colors hover:text-zinc-100"
          >
            Sign in
          </Link>
        </p>

      </div>
    </div>
  );
}
