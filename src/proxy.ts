import { NextResponse, type NextRequest } from "next/server";

// Terminal clients hitting the homepage get the ANSI resume from /cli instead of HTML.
const TERMINAL_UA = /^(curl|wget|httpie|xh)\b/i;

export function proxy(request: NextRequest) {
  if (TERMINAL_UA.test(request.headers.get("user-agent") ?? "")) {
    return NextResponse.rewrite(new URL("/cli", request.url));
  }
}

export const config = { matcher: "/" };
