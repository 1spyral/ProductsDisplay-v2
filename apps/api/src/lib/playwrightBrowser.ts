import { chromium, type Browser } from "playwright";

declare global {
    var __playwrightBrowser: Browser | undefined;
    var __playwrightBrowserPromise: Promise<Browser> | undefined;
}

export async function getPlaywrightBrowser(): Promise<Browser> {
    if (globalThis.__playwrightBrowser) return globalThis.__playwrightBrowser;

    if (!globalThis.__playwrightBrowserPromise) {
        globalThis.__playwrightBrowserPromise = chromium.launch();
    }

    try {
        globalThis.__playwrightBrowser =
            await globalThis.__playwrightBrowserPromise;
        return globalThis.__playwrightBrowser;
    } catch (err) {
        globalThis.__playwrightBrowserPromise = undefined;
        throw err;
    }
}
