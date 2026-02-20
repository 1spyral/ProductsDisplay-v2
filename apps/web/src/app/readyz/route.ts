import { getPlaywrightBrowser } from "@/lib/playwrightBrowser";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
    try {
        await getPlaywrightBrowser();
        return NextResponse.json({ status: "ok" }, { status: 200 });
    } catch (err) {
        const message = err instanceof Error ? err.message : "unknown";
        return NextResponse.json(
            { status: "error", reason: "playwright", message },
            { status: 503 }
        );
    }
}
