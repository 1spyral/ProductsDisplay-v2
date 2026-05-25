import type { ResolvedCompilePdfOptions } from "@/lib/pdf/compilePdf";

type CdpError = {
    message: string;
    code?: number;
};

type CdpMessage<T = unknown> = {
    id?: number;
    method?: string;
    params?: unknown;
    result?: T;
    error?: CdpError;
    sessionId?: string;
};

type PendingCommand = {
    resolve: (value: unknown) => void;
    reject: (error: Error) => void;
    timeout: Timer;
};

type CreateTargetResult = {
    targetId: string;
};

type AttachToTargetResult = {
    sessionId: string;
};

type GetFrameTreeResult = {
    frameTree: {
        frame: {
            id: string;
        };
    };
};

type PrintToPdfResult = {
    data: string;
};

const footerTemplate =
    '<div style="font-size: 10px; text-align: right; width: 100%; padding-right: 12mm;"><span class="pageNumber"></span>/<span class="totalPages"></span></div>';

const emptyHeaderTemplate = "<div></div>";

const cdpCommandTimeoutMs = 30_000;

class CdpConnection {
    private nextId = 1;
    private readonly pending = new Map<number, PendingCommand>();

    private constructor(private readonly socket: WebSocket) {
        this.socket.addEventListener("message", (event) => {
            this.handleMessage(String(event.data));
        });
        this.socket.addEventListener("close", () => {
            this.rejectAll(new Error("CDP websocket closed"));
        });
        this.socket.addEventListener("error", () => {
            this.rejectAll(new Error("CDP websocket error"));
        });
    }

    static async connect(webSocketUrl: string): Promise<CdpConnection> {
        const socket = new WebSocket(webSocketUrl);

        await new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error(`Timed out connecting to ${webSocketUrl}`));
                socket.close();
            }, cdpCommandTimeoutMs);

            socket.addEventListener(
                "open",
                () => {
                    clearTimeout(timeout);
                    resolve();
                },
                { once: true }
            );
            socket.addEventListener(
                "error",
                () => {
                    clearTimeout(timeout);
                    reject(new Error(`Failed to connect to ${webSocketUrl}`));
                },
                { once: true }
            );
        });

        return new CdpConnection(socket);
    }

    async send<T>(
        method: string,
        params: Record<string, unknown> = {},
        sessionId?: string
    ): Promise<T> {
        const id = this.nextId++;
        const payload = JSON.stringify({ id, method, params, sessionId });

        const response = new Promise<T>((resolve, reject) => {
            const timeout = setTimeout(() => {
                this.pending.delete(id);
                reject(
                    new Error(`Timed out waiting for CDP command ${method}`)
                );
            }, cdpCommandTimeoutMs);

            this.pending.set(id, {
                resolve: (value) => resolve(value as T),
                reject,
                timeout,
            });
        });

        this.socket.send(payload);
        return response;
    }

    close(): void {
        this.socket.close();
    }

    private handleMessage(rawMessage: string): void {
        const message = JSON.parse(rawMessage) as CdpMessage;
        if (!message.id) return;

        const pending = this.pending.get(message.id);
        if (!pending) return;

        clearTimeout(pending.timeout);
        this.pending.delete(message.id);

        if (message.error) {
            pending.reject(new Error(message.error.message));
            return;
        }

        pending.resolve(message.result);
    }

    private rejectAll(error: Error): void {
        for (const [id, pending] of this.pending.entries()) {
            clearTimeout(pending.timeout);
            pending.reject(error);
            this.pending.delete(id);
        }
    }
}

export async function compilePdfFromHtmlWithCdp(
    cdpUrl: string,
    html: string,
    options: ResolvedCompilePdfOptions
): Promise<Uint8Array> {
    const webSocketUrl = await resolveWebSocketDebuggerUrl(cdpUrl);
    const connection = await CdpConnection.connect(webSocketUrl);
    let targetId: string | undefined;

    try {
        const target = await connection.send<CreateTargetResult>(
            "Target.createTarget",
            { url: "about:blank" }
        );
        targetId = target.targetId;

        const attached = await connection.send<AttachToTargetResult>(
            "Target.attachToTarget",
            { targetId, flatten: true }
        );
        const sessionId = attached.sessionId;

        await connection.send("Page.enable", {}, sessionId);
        await connection.send("Runtime.enable", {}, sessionId);

        const frameTree = await connection.send<GetFrameTreeResult>(
            "Page.getFrameTree",
            {},
            sessionId
        );
        await connection.send(
            "Page.setDocumentContent",
            {
                frameId: frameTree.frameTree.frame.id,
                html,
            },
            sessionId
        );
        await waitForPageAssets(connection, sessionId);

        const pdf = await connection.send<PrintToPdfResult>(
            "Page.printToPDF",
            {
                landscape: options.landscape,
                printBackground: options.printBackground,
                displayHeaderFooter: true,
                headerTemplate: emptyHeaderTemplate,
                footerTemplate,
                ...formatToPaperSize(options.format),
                ...marginToInches(options.margin),
            },
            sessionId
        );

        return new Uint8Array(Buffer.from(pdf.data, "base64"));
    } finally {
        if (targetId) {
            await connection
                .send("Target.closeTarget", { targetId })
                .catch(() => undefined);
        }
        connection.close();
    }
}

async function resolveWebSocketDebuggerUrl(cdpUrl: string): Promise<string> {
    if (cdpUrl.startsWith("ws://") || cdpUrl.startsWith("wss://")) {
        return cdpUrl;
    }

    const endpointUrl = new URL(cdpUrl);
    const versionUrl = new URL("/json/version", endpointUrl);
    const response = await fetch(versionUrl);
    if (!response.ok) {
        throw new Error(
            `Failed to resolve CDP websocket URL: ${response.status} ${response.statusText}`
        );
    }

    const version = (await response.json()) as {
        webSocketDebuggerUrl?: string;
    };

    if (!version.webSocketDebuggerUrl) {
        throw new Error(
            "CDP /json/version did not return webSocketDebuggerUrl"
        );
    }

    const webSocketUrl = new URL(version.webSocketDebuggerUrl);
    if (
        ["localhost", "127.0.0.1", "0.0.0.0"].includes(webSocketUrl.hostname) &&
        !["localhost", "127.0.0.1"].includes(endpointUrl.hostname)
    ) {
        webSocketUrl.host = endpointUrl.host;
    }

    return webSocketUrl.toString();
}

async function waitForPageAssets(
    connection: CdpConnection,
    sessionId: string
): Promise<void> {
    await connection.send(
        "Runtime.evaluate",
        {
            awaitPromise: true,
            returnByValue: true,
            expression: `(() => new Promise((resolve) => {
                const done = () => {
                    const images = Array.from(document.images);
                    Promise.all(images.map((image) => {
                        if (!image.complete) {
                            return new Promise((imageDone) => {
                                image.addEventListener("load", imageDone, { once: true });
                                image.addEventListener("error", imageDone, { once: true });
                            });
                        }

                        if (typeof image.decode !== "function") return undefined;
                        return image.decode().catch(() => undefined);
                    })).then(resolve);
                };

                if (document.readyState === "loading") {
                    document.addEventListener("DOMContentLoaded", done, { once: true });
                } else {
                    done();
                }

                setTimeout(resolve, 5000);
            }))()`,
        },
        sessionId
    );
}

function formatToPaperSize(format: ResolvedCompilePdfOptions["format"]): {
    paperWidth: number;
    paperHeight: number;
} {
    if (format !== "A4") {
        throw new Error(`Unsupported PDF format: ${format}`);
    }

    return {
        paperWidth: 8.27,
        paperHeight: 11.69,
    };
}

function marginToInches(
    margin: ResolvedCompilePdfOptions["margin"]
): Record<string, number> {
    return {
        marginTop: cssLengthToInches(margin.top),
        marginRight: cssLengthToInches(margin.right),
        marginBottom: cssLengthToInches(margin.bottom),
        marginLeft: cssLengthToInches(margin.left),
    };
}

function cssLengthToInches(value: string): number {
    const match = value.trim().match(/^(-?\d+(?:\.\d+)?)(mm|cm|in|px)$/);
    if (!match) {
        throw new Error(`Unsupported PDF margin value: ${value}`);
    }

    const amount = Number(match[1]);
    const unit = match[2];

    switch (unit) {
        case "in":
            return amount;
        case "cm":
            return amount / 2.54;
        case "mm":
            return amount / 25.4;
        case "px":
            return amount / 96;
        default:
            throw new Error(`Unsupported PDF margin unit: ${unit}`);
    }
}
