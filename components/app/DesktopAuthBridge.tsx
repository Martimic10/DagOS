"use client";

/**
 * DesktopAuthBridge
 *
 * Mounts invisibly in the app layout. When the Electron main process receives
 * a dagos://auth deep link (from the browser login handoff), it sends an
 * 'auth:session' IPC message via preload. This component listens for that
 * message and hydrates the Supabase client session so the user is
 * automatically signed in without re-entering credentials.
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

declare global {
  interface Window {
    dagosDesktop?: {
      isDesktop: boolean;
      onAuthSession: (
        cb: (session: { access_token: string; refresh_token: string }) => void
      ) => () => void;
      onPlanRefresh: (cb: () => void) => () => void;
    };
  }
}

export function DesktopAuthBridge() {
  const router = useRouter();

  useEffect(() => {
    // Only active inside the Electron shell
    if (!window.dagosDesktop?.onAuthSession) return;

    const unsub = window.dagosDesktop.onAuthSession(async ({ access_token, refresh_token }) => {
      try {
        const supabase = createClient();
        const { error } = await supabase.auth.setSession({ access_token, refresh_token });
        if (!error) {
          // Refresh the current route so server components re-render with the new session
          router.refresh();
        }
      } catch {
        // Silent — the user can still log in manually
      }
    });

    return unsub;
  }, [router]);

  // Renders nothing
  return null;
}
