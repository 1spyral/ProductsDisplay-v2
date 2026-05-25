import { env } from "@/env";
import { compilePdfFromHtmlWithCdp } from "@/lib/pdf/cdpPdf";
import { getPlaywrightBrowser } from "@/lib/playwrightBrowser";

export type CompilePdfOptions = {
    format?: "A4";
    landscape?: boolean;
    printBackground?: boolean;
    margin?: {
        top: string;
        right: string;
        bottom: string;
        left: string;
    };
    waitUntil?: "load" | "domcontentloaded" | "networkidle";
};

const defaultOptions: Required<Omit<CompilePdfOptions, "landscape">> & {
    landscape: boolean;
} = {
    format: "A4",
    landscape: false,
    printBackground: true,
    margin: {
        top: "3mm",
        right: "0mm",
        bottom: "12mm",
        left: "0mm",
    },
    waitUntil: "networkidle",
};

export type ResolvedCompilePdfOptions = typeof defaultOptions;

export async function compilePdfFromHtml(
    html: string,
    options: CompilePdfOptions = {}
): Promise<Uint8Array> {
    const resolvedOptions = {
        ...defaultOptions,
        ...options,
        margin: {
            ...defaultOptions.margin,
            ...(options.margin ?? {}),
        },
    };

    if (env.PDF_BROWSER_CDP_URL) {
        return compilePdfFromHtmlWithCdp(
            env.PDF_BROWSER_CDP_URL,
            html,
            resolvedOptions
        );
    }

    const browser = await getPlaywrightBrowser();
    const context = await browser.newContext();

    try {
        const page = await context.newPage();

        await page.setContent(html, { waitUntil: resolvedOptions.waitUntil });

        const pdfBuffer = await page.pdf({
            format: resolvedOptions.format,
            landscape: resolvedOptions.landscape,
            printBackground: resolvedOptions.printBackground,
            margin: resolvedOptions.margin,
            displayHeaderFooter: true,
            footerTemplate:
                '<div style="font-size: 10px; text-align: right; width: 100%; padding-right: 12mm;"><span class="pageNumber"></span>/<span class="totalPages"></span></div>',
        });

        return new Uint8Array(pdfBuffer);
    } finally {
        await context.close();
    }
}
