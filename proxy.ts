import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/jwt";

const PUBLIC_ROUTES = ["/", "/sign-in", "/sign-up"];
const ADMIN_PREFIX = "/admin";

/**
 * Optimistic routing guard only — every API route re-checks the session and the
 * user's status against the database before touching data.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await verifySession(
    request.cookies.get(SESSION_COOKIE)?.value,
  );

  const isPublic = PUBLIC_ROUTES.includes(pathname);

  if (!session && !isPublic) {
    const url = new URL("/sign-in", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (session && (pathname === "/sign-in" || pathname === "/sign-up")) {
    return NextResponse.redirect(
      new URL(session.role === "ADMIN" ? "/admin" : "/dashboard", request.url),
    );
  }

  if (session?.role !== "ADMIN" && pathname.startsWith(ADMIN_PREFIX)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Everything except API routes, Next internals and static files.
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
