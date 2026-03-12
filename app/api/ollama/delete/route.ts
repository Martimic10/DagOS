import { NextRequest, NextResponse } from "next/server";

type DeleteResponse = { ok: true } | { ok: false; error: string };

export async function POST(req: NextRequest): Promise<NextResponse<DeleteResponse>> {
  let name: string;
  try {
    const body = await req.json();
    name = body.name;
    if (!name || typeof name !== "string") throw new Error("Missing model name");
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body" }, { status: 400 });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch("http://127.0.0.1:11434/api/delete", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
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
          ? "Request timed out"
          : err.message
        : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 200 });
  }
}
