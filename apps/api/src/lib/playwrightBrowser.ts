import { chromium, type Browser } from "playwright";

declare global {
    var __playwrightBrowser: Browser | undefined;
    var __playwrightBrowserPromise: Promise<Browser> | undefined;
}

export async function getPlaywrightBrowser(cdpUrl?: string): Promise<Browser> {
    if (globalThis.__playwrightBrowser) return globalThis.__playwrightBrowser;

    if (!globalThis.__playwrightBrowserPromise) {
        globalThis.__playwrightBrowserPromise = cdpUrl
            ? chromium.connectOverCDP(cdpUrl)
            : chromium.launch();
    }

    try {
        globalThis.__playwrightBrowser =
            await globalThis.__playwrightBrowserPromise;
        globalThis.__playwrightBrowser.on("disconnected", () => {
            globalThis.__playwrightBrowser = undefined;
            globalThis.__playwrightBrowserPromise = undefined;
        });
        return globalThis.__playwrightBrowser;
    } catch (err) {
        globalThis.__playwrightBrowserPromise = undefined;
        throw err;
    }
}
