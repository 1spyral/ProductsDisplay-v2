import { NextRequest, NextResponse } from "next/server";

export function isAuthenticated(request: NextRequest): boolean {
  const authCookie = request.cookies.get("admin-auth");
  return authCookie?.value === "authenticated";
}

export function handleAdminAuth(request: NextRequest): NextResponse | null {
  const authenticated = isAuthenticated(request);
  const pathname = request.nextUrl.pathname;

  // Handle /admin - redirect based on auth status
  if (pathname === "/admin") {
    if (authenticated) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    } else {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  // Protect dashboard - redirect to login if not authenticated
  if (pathname.startsWith("/admin/dashboard")) {
    if (!authenticated) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  // If authenticated and trying to access login, redirect to dashboard
  if (pathname === "/admin/login") {
    if (authenticated) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
  }

  // No redirect needed
  return null;
}

