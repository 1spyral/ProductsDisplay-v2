import {
    getAdminCookieNames,
    verifyAdminAccessToken,
    verifyAdminRefreshToken,
} from "@/lib/adminTokens";
import type { FastifyReply, FastifyRequest } from "fastify";

export async function isAdminAuthenticated(
    request: FastifyRequest
): Promise<boolean> {
    const { access, refresh } = getAdminCookieNames();
    const accessToken = request.cookies[access];
    if (accessToken) {
        try {
            await verifyAdminAccessToken(accessToken);
            return true;
        } catch {
            // Fall back to refresh token.
        }
    }

    const refreshToken = request.cookies[refresh];
    if (!refreshToken) return false;

    try {
        await verifyAdminRefreshToken(refreshToken);
        return true;
    } catch {
        return false;
    }
}

export async function requireAdmin(
    request: FastifyRequest,
    reply: FastifyReply
): Promise<void> {
    const authenticated = await isAdminAuthenticated(request);
    if (!authenticated) {
        reply.code(401).send({ error: "Unauthorized" });
    }
}
