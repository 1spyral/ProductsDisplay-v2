import { defineConfig } from "playwright/test";

const PORT = 41731;
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${PORT}`;

export default defineConfig({
    testDir: "./tests/e2e",
    fullyParallel: true,
    retries: process.env.CI ? 1 : 0,
    reporter: process.env.CI
        ? [["github"], ["html", { open: "never" }]]
        : "list",
    use: {
        baseURL: BASE_URL,
        trace: "retain-on-failure",
    },
    webServer: process.env.PLAYWRIGHT_BASE_URL
        ? undefined
        : {
              command: `bun --bun next dev --port ${PORT}`,
              url: BASE_URL,
              reuseExistingServer: !process.env.CI,
              timeout: 120_000,
          },
});
