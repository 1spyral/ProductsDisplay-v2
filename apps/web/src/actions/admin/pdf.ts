"use server";

import { requireAdminAuth } from "@/actions/admin/auth";
import { checkRateLimit } from "@/actions/admin/rateLimit";
import { env } from "@/env";
import { getAdminCookieNames } from "@/lib/adminTokens";
import { cookies } from "next/headers";

export async function compilePdf(productIds: string[]): Promise<Uint8Array> {
    await requireAdminAuth();
    await checkRateLimit("compilePdf", 1, 1000);

    const cookieStore = await cookies();
    const { access, refresh } = getAdminCookieNames();
    const cookieParts: string[] = [];

    const accessCookie = cookieStore.get(access);
    if (accessCookie) {
        cookieParts.push(`${access}=${accessCookie.value}`);
    }

    const refreshCookie = cookieStore.get(refresh);
    if (refreshCookie) {
        cookieParts.push(`${refresh}=${refreshCookie.value}`);
    }

    const response = await fetch(`${env.API_BASE_URL}/admin/pdf/compile`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(cookieParts.length > 0
                ? { Cookie: cookieParts.join("; ") }
                : {}),
        },
        body: JSON.stringify({ productIds }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to compile PDF: ${errorText}`);
    }

    const buffer = await response.arrayBuffer();
    return new Uint8Array(buffer);
}
