import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// TODO: enforce auth redirect when real auth is wired.
// Will redirect unauthenticated users (no lumora_session cookie)
// to /login, except /(marketing), /login, /signup routes.
export function proxy(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$).*)",
  ],
};
