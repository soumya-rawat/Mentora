import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Simple middleware that checks for auth session cookie
// Full auth validation happens in the app layout server component
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes
  const publicRoutes = ["/", "/login", "/register"];
  const isPublicRoute = publicRoutes.includes(pathname);
  const isApiAuthRoute = pathname.startsWith("/api/auth");
  const isStaticAsset = pathname.startsWith("/_next") || pathname.startsWith("/images") || pathname === "/favicon.ico";

  if (isStaticAsset || isApiAuthRoute) {
    return NextResponse.next();
  }

  // Check for session cookie (NextAuth uses authjs.session-token or __Secure-authjs.session-token)
  const sessionToken =
    request.cookies.get("authjs.session-token")?.value ||
    request.cookies.get("__Secure-authjs.session-token")?.value;

  if (isPublicRoute) {
    // Redirect logged-in users away from auth pages
    if (sessionToken && (pathname === "/login" || pathname === "/register")) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Protect all other routes
  if (!sessionToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images|logo.svg).*)",
  ],
};
