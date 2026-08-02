import { apiFetch } from "./client";

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
};

export type MeResponse = {
  id: string;
  email: string;
  createdAt: string;
};

export function login(email: string, password: string) {
  return apiFetch<AuthTokens>("/auth/login", {
    method: "POST",
    body: { email, password },
  });
}

export function register(email: string, password: string) {
  return apiFetch<AuthTokens>("/auth/register", {
    method: "POST",
    body: { email, password },
  });
}

export function getMe() {
  return apiFetch<MeResponse>("/auth/me");
}
