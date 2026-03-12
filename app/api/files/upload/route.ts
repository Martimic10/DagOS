import { NextRequest, NextResponse } from "next/server";

// Force Node.js runtime — pdf-parse requires fs/Buffer
export const runtime = "nodejs";

type UploadResponse =
  | { ok: true; text: string; truncated: boolean }
  | { ok: false; error: string };

const MAX_EXTRACT_BYTES = 300_000; // 300 KB of text is plenty for any local model

export async function POST(
  req: NextRequest
): Promise<NextResponse<UploadResponse>> {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!file || typeof file === "string") {
    return NextResponse.json({ ok: false, error: "No file provided" }, { status: 400 });
  }

  const bytes = await (file as File).arrayBuffer();
  const buffer = Buffer.from(bytes);

  try {
    // pdf-parse is CommonJS — require() is reliable on the Node.js runtime
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require("pdf-parse") as (buf: Buffer) => Promise<{ text: string }>;
    const data = await pdfParse(buffer);
    const text = data.text ?? "";
    const truncated = text.length > MAX_EXTRACT_BYTES;
    return NextResponse.json({
      ok: true,
      text: truncated ? text.slice(0, MAX_EXTRACT_BYTES) : text,
      truncated,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { ok: false, error: `PDF extraction failed: ${msg}` },
      { status: 500 }
    );
  }
}
