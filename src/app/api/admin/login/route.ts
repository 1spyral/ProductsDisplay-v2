import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
    const { password } = await request.json();

    // Check against environment variable
    if (password === process.env.ADMIN_PASSWORD) {
        // Set a secure cookie
        const cookieStore = await cookies();
        cookieStore.set("admin-auth", "authenticated", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 60 * 60 * 24, // 24 hours
            path: "/",
        });

        return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false }, { status: 401 });
}
