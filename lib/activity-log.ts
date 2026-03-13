// Activity log — persisted to localStorage under dagos_activity_log

export type ActivityRoute = "chat" | "models" | "dashboard" | "files" | "system";
export type ActivityAction =
  | "chat_request"
  | "model_run"
  | "model_delete"
  | "model_install"
  | "file_analyze"
  | "runtime_start";
export type ActivityStatus = "success" | "error";

export interface ActivityEvent {
  id: string;
  timestamp: string; // ISO 8601
  route: ActivityRoute;
  action: ActivityAction;
  model?: string;
  latencyMs?: number;
  status: ActivityStatus;
  promptLength?: number;
  responseLength?: number;
}

const LOG_KEY = "dagos_activity_log";
const MAX_EVENTS = 500;

export function loadActivityLog(): ActivityEvent[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(LOG_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function appendActivityEvent(
  event: Omit<ActivityEvent, "id" | "timestamp">
): void {
  if (typeof window === "undefined") return;
  const log = loadActivityLog();
  const entry: ActivityEvent = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    ...event,
  };
  log.unshift(entry); // newest first
  if (log.length > MAX_EVENTS) log.length = MAX_EVENTS;
  localStorage.setItem(LOG_KEY, JSON.stringify(log));
}
