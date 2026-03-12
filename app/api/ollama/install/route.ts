export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let model: string;
  try {
    const body = await req.json();
    model = (body.model ?? "").trim();
    if (!model) throw new Error("Missing model name");
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "Invalid request body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch {
          // controller may already be closed
        }
      };

      try {
        const res = await fetch("http://127.0.0.1:11434/api/pull", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: model, stream: true }),
          cache: "no-store",
        });

        if (!res.ok || !res.body) {
          const text = await res.text().catch(() => "");
          send({ ok: false, error: text || `Ollama HTTP ${res.status}` });
          controller.close();
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        outer: while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            try {
              const json = JSON.parse(trimmed) as {
                status?: string;
                digest?: string;
                total?: number;
                completed?: number;
                error?: string;
              };

              if (json.error) {
                send({ ok: false, error: json.error });
                break outer;
              }

              if (json.status === "success") {
                send({ ok: true, status: "success" });
                break outer;
              }

              // Forward progress event
              send({
                ok: true,
                status: json.status,
                digest: json.digest,
                total: json.total,
                completed: json.completed,
              });
            } catch {
              // non-JSON line — skip
            }
          }
        }

        // Flush leftover buffer
        if (buffer.trim()) {
          try {
            const json = JSON.parse(buffer.trim()) as { status?: string };
            if (json.status === "success") send({ ok: true, status: "success" });
          } catch { /* ignore */ }
        }
      } catch (err) {
        const msg =
          err instanceof Error
            ? err.message.includes("ECONNREFUSED") || err.message.includes("fetch")
              ? "Cannot reach Ollama. Is it running?"
              : err.message
            : "Unknown error";
        send({ ok: false, error: msg });
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
