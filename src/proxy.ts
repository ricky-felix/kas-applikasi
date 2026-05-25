import { NextRequest, NextResponse } from "next/server";

const ROLE_PATHS: Record<string, string> = {
  super_admin: "/super-admin",
  owner: "/owner",
  admin: "/admin",
  worker: "/worker",
};

const PROTECTED = Object.values(ROLE_PATHS);

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const raw = req.cookies.get("kas-session")?.value;

  const session = (() => {
    if (!raw) return null;
    try { return JSON.parse(raw) as { role: string }; }
    catch { return null; }
  })();

  // Redirect logged-in users away from login
  if (pathname === "/" && session) {
    const dest = ROLE_PATHS[session.role];
    if (dest) return NextResponse.redirect(new URL(dest, req.url));
  }

  // Protect role routes
  if (PROTECTED.some((p) => pathname.startsWith(p))) {
    if (!session) return NextResponse.redirect(new URL("/", req.url));
    const expected = ROLE_PATHS[session.role];
    if (!pathname.startsWith(expected))
      return NextResponse.redirect(new URL(expected, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/worker/:path*", "/owner/:path*", "/admin/:path*", "/super-admin/:path*"],
};
