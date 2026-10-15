import { NextResponse, type NextRequest } from "next/server";

import { PREVIEW_COOKIE } from "@/engine/preview";

// Entry point of the platform admin's "Preview" link. Stores the signed token
// in a cookie (the API checks it on every call) and lands on the page named by
// ?to= (home by default). /site-preview?exit clears it.

/** Relative redirect: the browser resolves it against the host it's actually
 * on. An absolute URL built here would use the server's own hostname, not the
 * tenant's (behind Caddy, or for *.localhost in dev). */
function redirectTo(path: string): NextResponse {
  return new NextResponse(null, { status: 307, headers: { Location: path } });
}

export function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  if (params.has("exit")) {
    const response = redirectTo("/");
    response.cookies.delete(PREVIEW_COOKIE);
    return response;
  }
  const token = params.get("token");
  if (!token || token.length > 300) return new NextResponse("Invalid preview link", { status: 400 });
  // Same-site paths only, never //host or a scheme.
  const to = params.get("to");
  const response = redirectTo(to && /^\/(?!\/)[\w\-/]*$/.test(to) ? to : "/");
  response.cookies.set(PREVIEW_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: request.headers.get("x-forwarded-proto") === "https" || request.nextUrl.protocol === "https:",
    path: "/",
    maxAge: 24 * 60 * 60,
  });
  return response;
}
