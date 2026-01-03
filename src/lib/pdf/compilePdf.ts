import { getPlaywrightBrowser } from "@/lib/playwrightBrowser";

export type CompilePdfOptions = {
    format?: "A4";
    printBackground?: boolean;
    margin?: {
        top: string;
        right: string;
        bottom: string;
        left: string;
    };
    waitUntil?: "load" | "domcontentloaded" | "networkidle";
};

const defaultOptions: Required<CompilePdfOptions> = {
    format: "A4",
    printBackground: true,
    margin: {
        top: "12mm",
        right: "12mm",
        bottom: "12mm",
        left: "12mm",
    },
    waitUntil: "networkidle",
};

export async function compilePdfFromHtml(
    html: string,
    options: CompilePdfOptions = {}
): Promise<Uint8Array> {
    const browser = await getPlaywrightBrowser();
    const context = await browser.newContext();

    try {
        const page = await context.newPage();

        const resolvedOptions = {
            ...defaultOptions,
            ...options,
            margin: {
                ...defaultOptions.margin,
                ...(options.margin ?? {}),
            },
        };

        await page.setContent(html, { waitUntil: resolvedOptions.waitUntil });

        const pdfBuffer = await page.pdf({
            format: resolvedOptions.format,
            printBackground: resolvedOptions.printBackground,
            margin: resolvedOptions.margin,
        });

        return new Uint8Array(pdfBuffer);
    } finally {
        await context.close();
    }
}
