import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const API_URL = process.env.API_URL ?? "http://localhost:8000";

const SESSION_COOKIE = "lumora_session";
const REFRESH_COOKIE = "lumora_refresh";
const AUTH_ACTIONS = ["login", "register", "refresh"];
const MAX_REDIRECT_HOPS = 3;
const BODY_METHODS = ["POST", "PUT", "PATCH", "DELETE"];
const REDIRECT_STATUSES = [301, 302, 303, 307, 308];

const FORWARDED_HEADERS = [
  "content-type",
  "content-disposition",
  "content-length",
];

type TokenBody = {
  accessToken?: unknown;
  refreshToken?: unknown;
};

function isTokenBody(value: unknown): value is TokenBody {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as TokenBody).accessToken === "string" &&
    typeof (value as TokenBody).refreshToken === "string"
  );
}

function setSessionCookies(
  response: NextResponse,
  { accessToken, refreshToken }: TokenBody
) {
  const base = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  };
  response.cookies.set(SESSION_COOKIE, accessToken as string, base);
  response.cookies.set(REFRESH_COOKIE, refreshToken as string, base);
}

function clearSessionCookies(response: NextResponse) {
  response.cookies.delete(SESSION_COOKIE);
  response.cookies.delete(REFRESH_COOKIE);
}

async function handle(
  request: NextRequest,
  ctx: { params: Promise<{ path: string[] }> }
) {
  const { path } = await ctx.params;
  const pathname = path.join("/");
  const query = request.nextUrl.search;

  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  if (contentType) {
    headers.set("content-type", contentType);
  }
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (token) {
    headers.set("authorization", `Bearer ${token}`);
  }

  const isAuthAction =
    pathname.startsWith("auth/") &&
    AUTH_ACTIONS.includes(pathname.split("/").pop() ?? "");

  let body: Buffer | undefined;
  if (BODY_METHODS.includes(request.method)) {
    if (pathname === "auth/refresh") {
      const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
      if (refreshToken) {
        headers.set("content-type", "application/json");
        body = Buffer.from(JSON.stringify({ refreshToken }));
      }
    } else if (request.body) {
      body = Buffer.from(await request.arrayBuffer());
    }
  }

  let upstreamRes: Response | null = null;
  let target = `${API_URL}/api/${pathname}${query}`;

  try {
    for (let hop = 0; hop < MAX_REDIRECT_HOPS; hop++) {
      const response = await fetch(target, {
        method: request.method,
        headers,
        body: body ? Buffer.from(body) : undefined,
        redirect: "manual",
      });

      const location = response.headers.get("location");
      const isRedirect =
        REDIRECT_STATUSES.includes(response.status) && location;

      if (isRedirect) {
        void response.body?.cancel().catch(() => {});
        target = new URL(location, API_URL).toString();
        continue;
      }

      upstreamRes = response;
      break;
    }
  } catch (error) {
    console.error("[api-proxy] upstream fetch failed", error);
    return NextResponse.json(
      { detail: "Backend is unreachable. Is the Lumora server running?" },
      { status: 502 }
    );
  }

  if (!upstreamRes) {
    return NextResponse.json(
      { detail: "Backend redirect loop." },
      { status: 502 }
    );
  }

  const responseHeaders = new Headers();
  FORWARDED_HEADERS.forEach((name) => {
    const value = upstreamRes.headers.get(name);
    if (value) {
      responseHeaders.set(name, value);
    }
  });

  if (isAuthAction) {
    const text = await upstreamRes.text();
    let data: unknown;
    try {
      data = text ? JSON.parse(text) : undefined;
    } catch {
      data = text;
    }

    if (upstreamRes.ok && isTokenBody(data)) {
      const response = NextResponse.json(data, {
        status: upstreamRes.status,
      });
      setSessionCookies(response, data);
      return response;
    }

    if (pathname === "auth/refresh" && upstreamRes.status === 401) {
      const response = NextResponse.json(data, { status: upstreamRes.status });
      clearSessionCookies(response);
      return response;
    }

    return NextResponse.json(data, { status: upstreamRes.status });
  }

  return new Response(upstreamRes.body, {
    status: upstreamRes.status,
    headers: responseHeaders,
  });
}

export const GET = handle;
export const POST = handle;
export const PATCH = handle;
export const PUT = handle;
export const DELETE = handle;
