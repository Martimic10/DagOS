import { NextResponse } from "next/server";

export interface OllamaModel {
  name: string;
  size: number;
  modified_at: string;
}

export type ModelsResponse =
  | { ok: true; models: OllamaModel[] }
  | { ok: false; error: string };

export async function GET(): Promise<NextResponse<ModelsResponse>> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);

  try {
    const res = await fetch("http://127.0.0.1:11434/api/tags", {
      signal: controller.signal,
      cache: "no-store",
    });

    clearTimeout(timeout);

    if (!res.ok) {
      return NextResponse.json(
        { ok: false, error: `Ollama responded with HTTP ${res.status}` },
        { status: 200 }
      );
    }

    const data = await res.json();

    // Ollama returns { models: [{ name, size, modified_at, digest, details }] }
    const models: OllamaModel[] = (data.models ?? []).map(
      (m: { name: string; size: number; modified_at: string }) => ({
        name: m.name,
        size: m.size,
        modified_at: m.modified_at,
      })
    );

    return NextResponse.json({ ok: true, models }, { status: 200 });
  } catch (err) {
    clearTimeout(timeout);
    const message =
      err instanceof Error
        ? err.name === "AbortError"
          ? "Connection timed out"
          : err.message
        : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 200 });
  }
}
