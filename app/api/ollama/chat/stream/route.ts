import { NextRequest } from "next/server";
import type { ChatMessage } from "@/app/api/ollama/chat/route";

const FORMATTING_SYSTEM = `When writing any code, always wrap it in a fenced code block with the correct language tag.
Examples: \`\`\`html, \`\`\`javascript, \`\`\`typescript, \`\`\`python, \`\`\`css, \`\`\`bash, \`\`\`json, \`\`\`rust, \`\`\`go.
Never write code as plain prose or inline in a sentence. Every code snippet, no matter how short, must be inside a fenced block.
For non-code responses, write normally.`;

function injectFormattingPrompt(messages: ChatMessage[]): ChatMessage[] {
  const first = messages[0];
  if (first?.role === "system") {
    // Prepend formatting instructions to the existing system message
    return [
      { ...first, content: `${FORMATTING_SYSTEM}\n\n${first.content}` },
      ...messages.slice(1),
    ];
  }
  // No system message — inject one at the front
  return [{ role: "system", content: FORMATTING_SYSTEM }, ...messages];
}

export async function POST(req: NextRequest): Promise<Response> {
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
    return new Response("Invalid request body", { status: 400 });
  }

  messages = injectFormattingPrompt(messages);

  const upstream = new AbortController();

  // When the client disconnects, abort the upstream fetch
  req.signal.addEventListener("abort", () => upstream.abort());

  let ollamaRes: Response;
  try {
    ollamaRes = await fetch("http://127.0.0.1:11434/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model, messages, stream: true, options: { temperature } }),
      signal: upstream.signal,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return new Response(`event: error\ndata: ${msg}\n\n`, {
      status: 200,
      headers: { "Content-Type": "text/event-stream" },
    });
  }

  if (!ollamaRes.ok || !ollamaRes.body) {
    const text = await ollamaRes.text().catch(() => "");
    return new Response(`event: error\ndata: ${text || `HTTP ${ollamaRes.status}`}\n\n`, {
      status: 200,
      headers: { "Content-Type": "text/event-stream" },
    });
  }

  const ollamaBody = ollamaRes.body;

  const stream = new ReadableStream({
    async start(controller) {
      const reader = ollamaBody.getReader();
      const decoder = new TextDecoder();
      let buf = "";

      const enc = (s: string) => new TextEncoder().encode(s);

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buf += decoder.decode(value, { stream: true });
          const lines = buf.split("\n");
          buf = lines.pop() ?? "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            try {
              const chunk = JSON.parse(trimmed);
              const token: string = chunk?.message?.content ?? "";
              if (token) {
                controller.enqueue(enc(`data: ${token}\n\n`));
              }
              if (chunk?.done) {
                controller.enqueue(enc(`event: done\ndata: done\n\n`));
              }
            } catch {
              // malformed JSON line — skip
            }
          }
        }
        // flush remaining buffer
        if (buf.trim()) {
          try {
            const chunk = JSON.parse(buf.trim());
            const token: string = chunk?.message?.content ?? "";
            if (token) controller.enqueue(enc(`data: ${token}\n\n`));
            if (chunk?.done) controller.enqueue(enc(`event: done\ndata: done\n\n`));
          } catch { /* ignore */ }
        }
      } catch (err) {
        if (upstream.signal.aborted) {
          controller.enqueue(enc(`event: done\ndata: done\n\n`));
        } else {
          const msg = err instanceof Error ? err.message : "Stream error";
          controller.enqueue(enc(`event: error\ndata: ${msg}\n\n`));
        }
      } finally {
        reader.releaseLock();
        controller.close();
      }
    },
    cancel() {
      upstream.abort();
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
