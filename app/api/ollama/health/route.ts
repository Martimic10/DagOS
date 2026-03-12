import { NextResponse } from "next/server";

export type OllamaHealthResponse =
  | { ok: true }
  | { ok: false; error: string };

export async function GET(): Promise<NextResponse<OllamaHealthResponse>> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2000);

  try {
    const res = await fetch("http://127.0.0.1:11434/api/tags", {
      signal: controller.signal,
      // Disable Next.js caching so every call is live
      cache: "no-store",
    });

    clearTimeout(timeout);

    if (!res.ok) {
      return NextResponse.json(
        { ok: false, error: `Ollama responded with HTTP ${res.status}` },
        { status: 200 }
      );
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    clearTimeout(timeout);

    const message =
      err instanceof Error
        ? err.name === "AbortError"
          ? "Connection timed out after 2s"
          : err.message
        : "Unknown error";

    return NextResponse.json({ ok: false, error: message }, { status: 200 });
  }
}
