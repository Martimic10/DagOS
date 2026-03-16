// ── Plan logic ────────────────────────────────────────────────────────────────
// Single source of truth for Free vs Pro.
// Today: localStorage override for testing.
// Future: replace/extend with Stripe subscription status from Supabase.

export const PRO_OVERRIDE_KEY = "dagos_pro_override";

/**
 * Determine if the user has Pro access.
 * @param isProFromDb - the is_pro field from user_profiles (Supabase)
 */
export function checkIsPro(isProFromDb: boolean): boolean {
  if (isProFromDb) return true;
  if (typeof window === "undefined") return false;
  return localStorage.getItem(PRO_OVERRIDE_KEY) === "true";
}

export function enableProOverride(): void {
  localStorage.setItem(PRO_OVERRIDE_KEY, "true");
  window.dispatchEvent(new Event("dagos:plan-changed"));
}

export function disableProOverride(): void {
  localStorage.removeItem(PRO_OVERRIDE_KEY);
  window.dispatchEvent(new Event("dagos:plan-changed"));
}

export function getProOverride(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(PRO_OVERRIDE_KEY) === "true";
}

// ── Future Stripe integration hook point ──────────────────────────────────────
// When adding Stripe, check subscription status from Supabase here:
//
//   const { data } = await supabase
//     .from("user_profiles")
//     .select("is_pro, stripe_subscription_status")
//     .eq("id", user.id)
//     .single();
//
//   return data?.is_pro === true || data?.stripe_subscription_status === "active";
