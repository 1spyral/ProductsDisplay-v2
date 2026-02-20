import { env } from "@/env";
import { headers } from "next/headers";

type ApiRequestOptions = RequestInit & {
    forwardCookies?: boolean;
};

async function getRequestCookieHeader(): Promise<string | null> {
    try {
        const requestHeaders = await headers();
        return requestHeaders.get("cookie");
    } catch {
        return null;
    }
}

function buildApiUrl(path: string): string {
    return `${env.API_BASE_URL}${path}`;
}

function extractErrorMessage(payload: unknown): string | null {
    if (!payload || typeof payload !== "object") return null;
    if ("message" in payload && typeof payload.message === "string") {
        return payload.message;
    }
    if ("error" in payload && typeof payload.error === "string") {
        return payload.error;
    }
    return null;
}

export async function apiJsonRequest<T>(
    path: string,
    options: ApiRequestOptions = {}
): Promise<T> {
    const { forwardCookies = false, headers: inputHeaders, ...rest } = options;
    const requestHeaders = new Headers(inputHeaders);

    if (forwardCookies) {
        const cookie = await getRequestCookieHeader();
        if (cookie) {
            requestHeaders.set("cookie", cookie);
        }
    }

    if (
        rest.body &&
        !(rest.body instanceof FormData) &&
        !requestHeaders.has("content-type")
    ) {
        requestHeaders.set("content-type", "application/json");
    }

    const response = await fetch(buildApiUrl(path), {
        ...rest,
        headers: requestHeaders,
        cache: "no-store",
    });

    let payload: unknown = null;
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
        payload = await response.json();
    }

    if (!response.ok) {
        const message =
            extractErrorMessage(payload) ||
            `API request failed with status ${response.status}`;
        throw new Error(message);
    }

    return payload as T;
}
