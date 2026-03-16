"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { PRO_OVERRIDE_KEY, checkIsPro } from "@/lib/plan";

export function usePlan() {
  const [isPro, setIsPro]     = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);

    // Fast path: local override (for Pro Preview testing)
    if (typeof window !== "undefined" && localStorage.getItem(PRO_OVERRIDE_KEY) === "true") {
      setIsPro(true);
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data } = await supabase
          .from("user_profiles")
          .select("is_pro")
          .eq("id", user.id)
          .single();

        setIsPro(checkIsPro(data?.is_pro === true));
      } else {
        setIsPro(false);
      }
    } catch {
      setIsPro(false);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();

    // Re-check when the Pro override toggle fires (settings page)
    window.addEventListener("dagos:plan-changed", refresh);

    // Re-check when Electron receives a dagos://auth-refresh deep link
    // (fired by the Stripe success page after payment completes)
    const unsubPlanRefresh = window.dagosDesktop?.onPlanRefresh?.(refresh);

    let channel: ReturnType<ReturnType<typeof createClient>["channel"]> | null = null;

    // Subscribe to Supabase Realtime so a payment (Stripe webhook → is_pro = true)
    // instantly reflects here — works across browser AND desktop simultaneously.
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      channel = supabase
        .channel(`plan:${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "user_profiles",
            filter: `id=eq.${user.id}`,
          },
          (payload) => {
            const updated = payload.new as { is_pro?: boolean };
            setIsPro(checkIsPro(updated?.is_pro === true));
          }
        )
        .subscribe();
    })();

    return () => {
      window.removeEventListener("dagos:plan-changed", refresh);
      unsubPlanRefresh?.();
      if (channel) {
        createClient().removeChannel(channel);
      }
    };
  }, [refresh]);

  return { isPro, loading, refresh };
}
