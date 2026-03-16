"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2, MonitorCheck, AlertCircle } from "lucide-react";

type Status = "loading" | "launching" | "success" | "no_session" | "error";

export default function DesktopHandoffPage() {
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    async function handoff() {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          setStatus("no_session");
          return;
        }

        setStatus("launching");

        const deepLink =
          `dagos://auth` +
          `?access_token=${encodeURIComponent(session.access_token)}` +
          `&refresh_token=${encodeURIComponent(session.refresh_token)}`;

        // Open the deep link — the OS routes it to the Electron app
        window.location.href = deepLink;

        // Brief pause then show success (the tab may stay open)
        setTimeout(() => setStatus("success"), 1200);
      } catch {
        setStatus("error");
      }
    }

    handoff();
  }, []);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050508]">
      {/* Background grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      {/* Indigo glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/10 blur-[120px]" />

      <div className="relative z-10 flex flex-col items-center gap-6 px-6 text-center">
        {/* Logo mark */}
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900">
          <div className="h-4 w-4 rounded-sm bg-zinc-100" />
        </div>

        {status === "loading" && (
          <>
            <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
            <p className="font-mono text-sm text-zinc-500">Preparing session…</p>
          </>
        )}

        {status === "launching" && (
          <>
            <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
            <div className="flex flex-col gap-1">
              <p className="font-mono text-base font-semibold text-zinc-100">
                Opening DagOS…
              </p>
              <p className="font-mono text-xs text-zinc-500">
                Your session is being sent to the desktop app.
              </p>
            </div>
          </>
        )}

        {status === "success" && (
          <>
            <MonitorCheck className="h-6 w-6 text-emerald-400" />
            <div className="flex flex-col gap-1">
              <p className="font-mono text-base font-semibold text-zinc-100">
                You're signed in
              </p>
              <p className="font-mono text-xs text-zinc-500">
                Switch back to the DagOS desktop app. You can close this tab.
              </p>
            </div>
          </>
        )}

        {status === "no_session" && (
          <>
            <AlertCircle className="h-6 w-6 text-amber-400" />
            <div className="flex flex-col gap-1">
              <p className="font-mono text-base font-semibold text-zinc-100">
                No active session
              </p>
              <p className="font-mono text-xs text-zinc-500">
                Please{" "}
                <a href="/login" className="text-indigo-400 hover:underline">
                  log in
                </a>{" "}
                first, then return here.
              </p>
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <AlertCircle className="h-6 w-6 text-red-400" />
            <div className="flex flex-col gap-1">
              <p className="font-mono text-base font-semibold text-zinc-100">
                Something went wrong
              </p>
              <p className="font-mono text-xs text-zinc-500">
                Try{" "}
                <a href="/login" className="text-indigo-400 hover:underline">
                  logging in again
                </a>
                .
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
