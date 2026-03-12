import { NextResponse } from "next/server";

export interface RunningModel {
  name: string;
  size_vram: number;
  expires_at: string;
}

export type RunningResponse =
  | { ok: true; models: RunningModel[] }
  | { ok: false; error: string };

export async function GET(): Promise<NextResponse<RunningResponse>> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);

  try {
    const res = await fetch("http://127.0.0.1:11434/api/ps", {
      signal: controller.signal,
      cache: "no-store",
    });

    clearTimeout(timeout);

    if (!res.ok) {
      return NextResponse.json({ ok: false, error: `Ollama HTTP ${res.status}` }, { status: 200 });
    }

    const data = await res.json();
    const models: RunningModel[] = (data.models ?? []).map(
      (m: { name: string; size_vram?: number; expires_at?: string }) => ({
        name: m.name,
        size_vram: m.size_vram ?? 0,
        expires_at: m.expires_at ?? "",
      })
    );

    return NextResponse.json({ ok: true, models }, { status: 200 });
  } catch (err) {
    clearTimeout(timeout);
    const message =
      err instanceof Error
        ? err.name === "AbortError" ? "Connection timed out" : err.message
        : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 200 });
  }
}
