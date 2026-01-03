import { NextResponse } from "next/server";
import { compilePdfFromHtml } from "@/lib/pdf/compilePdf";

export const runtime = "nodejs";

export async function POST() {
    const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Test PDF</title>
    <style>
      body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; padding: 48px; }
      h1 { font-size: 28px; margin: 0 0 12px 0; }
      p { font-size: 14px; margin: 0; }
    </style>
  </head>
  <body>
    <h1>test</h1>
    <p>If you can read this, PDF rendering works.</p>
  </body>
</html>`;

    try {
        const pdfBytes = await compilePdfFromHtml(html);
        const pdfArrayBuffer = pdfBytes.buffer.slice(
            pdfBytes.byteOffset,
            pdfBytes.byteOffset + pdfBytes.byteLength
        ) as ArrayBuffer;
        const pdfBlob = new Blob([pdfArrayBuffer], { type: "application/pdf" });

        return new NextResponse(pdfBlob, {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": 'inline; filename="document.pdf"',
                "Cache-Control": "no-store",
            },
        });
    } catch (err) {
        return NextResponse.json(
            {
                error: "Failed to compile PDF",
                message: err instanceof Error ? err.message : String(err),
            },
            { status: 500 }
        );
    }
}
