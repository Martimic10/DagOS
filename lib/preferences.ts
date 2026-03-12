export const PREFS_KEY = "dagos_preferences";

export interface Prefs {
  showLatencyBadge: boolean;
  compactActivityTable: boolean;
  show24hClock: boolean;
  autoScrollChat: boolean;
  showModelSizes: boolean;
}

export const DEFAULT_PREFS: Prefs = {
  showLatencyBadge: true,
  compactActivityTable: false,
  show24hClock: true,
  autoScrollChat: true,
  showModelSizes: true,
};

export function loadPrefs(): Prefs {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return DEFAULT_PREFS;
    return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PREFS;
  }
}

export function savePrefs(prefs: Prefs): void {
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}
