import { NextRequest, NextResponse } from "next/server";

type RunResponse = { ok: true } | { ok: false; error: string };

export async function POST(req: NextRequest): Promise<NextResponse<RunResponse>> {
  let model: string;
  try {
    const body = await req.json();
    model = body.model;
    if (!model || typeof model !== "string") throw new Error("Missing model name");
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body" }, { status: 400 });
  }

  const controller = new AbortController();
  // Generation can be slow on first load — allow 30s
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const res = await fetch("http://127.0.0.1:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model, prompt: "test", stream: false }),
      signal: controller.signal,
      cache: "no-store",
    });

    clearTimeout(timeout);

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return NextResponse.json(
        { ok: false, error: text || `HTTP ${res.status}` },
        { status: 200 }
      );
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    clearTimeout(timeout);
    const message =
      err instanceof Error
        ? err.name === "AbortError"
          ? "Model load timed out (30s)"
          : err.message
        : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 200 });
  }
}
