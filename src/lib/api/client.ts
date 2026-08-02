import { ApiError } from "@/types/api";

export type ApiRequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  headers?: HeadersInit;
  signal?: AbortSignal;
  skipAuthRetry?: boolean;
};

const API_BASE = "/api";

function extractError(data: unknown, status: number): ApiError {
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    if (typeof obj.detail === "string") {
      return new ApiError(obj.detail, status, data);
    }
    const error = obj.error as Record<string, unknown> | undefined;
    if (error && typeof error.message === "string") {
      return new ApiError(error.message, status, data);
    }
    if (typeof obj.message === "string") {
      return new ApiError(obj.message, status, data);
    }
  }
  if (typeof data === "string" && data.length > 0) {
    return new ApiError(data, status);
  }
  return new ApiError(`Request failed with status ${status}`, status, data);
}

async function refreshSession(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "same-origin",
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function apiFetch<T>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const {
    method = "GET",
    body,
    headers: extraHeaders,
    signal,
    skipAuthRetry = false,
  } = options;

  const headers = new Headers(extraHeaders);
  if (
    body !== undefined &&
    !(body instanceof FormData) &&
    !headers.has("content-type")
  ) {
    headers.set("content-type", "application/json");
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body:
      body === undefined
        ? undefined
        : body instanceof FormData
          ? body
          : JSON.stringify(body),
    signal,
    credentials: "same-origin",
  });

  if (response.status === 401 && !skipAuthRetry) {
    const refreshed = await refreshSession();
    if (refreshed) {
      return apiFetch<T>(path, { ...options, skipAuthRetry: true });
    }
    throw new ApiError("Your session has expired. Please log in again.", 401);
  }

  const text = await response.text();
  let data: unknown;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    throw extractError(data, response.status);
  }

  return data as T;
}
