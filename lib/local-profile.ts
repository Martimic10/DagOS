const PROFILE_KEY = "dagos_user_profile";

export interface LocalProfile {
  firstName: string;
}

export function loadProfile(): LocalProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.firstName === "string") return parsed as LocalProfile;
    return null;
  } catch {
    return null;
  }
}

export function saveProfile(profile: LocalProfile): void {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

/** Returns the display name: first word of firstName, trimmed, or "Local User". */
export function displayName(profile: LocalProfile | null): string {
  if (!profile?.firstName) return "Local User";
  const first = profile.firstName.trim().split(/\s+/)[0];
  return first || "Local User";
}

/** Returns the avatar initial letter. */
export function displayInitial(profile: LocalProfile | null): string {
  return displayName(profile).charAt(0).toUpperCase();
}
