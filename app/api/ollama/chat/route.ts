import { NextRequest, NextResponse } from "next/server";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

type ChatResponse =
  | { ok: true; message: ChatMessage }
  | { ok: false; error: string };

export async function POST(req: NextRequest): Promise<NextResponse<ChatResponse>> {
  let model: string;
  let messages: ChatMessage[];
  let temperature: number;

  try {
    const body = await req.json();
    model = body.model;
    messages = body.messages;
    temperature = typeof body.temperature === "number" ? body.temperature : 0.7;

    if (!model || typeof model !== "string") throw new Error("Missing model");
    if (!Array.isArray(messages) || messages.length === 0) throw new Error("Missing messages");
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body" }, { status: 400 });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 120000);

  try {
    const res = await fetch("http://127.0.0.1:11434/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model, messages, stream: false, options: { temperature } }),
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

    const data = await res.json();
    const message: ChatMessage = data.message ?? { role: "assistant", content: "" };
    return NextResponse.json({ ok: true, message }, { status: 200 });
  } catch (err) {
    clearTimeout(timeout);
    const message =
      err instanceof Error
        ? err.name === "AbortError"
          ? "Request timed out (120s)"
          : err.message
        : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 200 });
  }
}
