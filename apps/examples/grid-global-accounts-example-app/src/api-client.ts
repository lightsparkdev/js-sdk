// HTTP client + auth header + mode resolution.
//
// DOM-free: the platform credentials (client id / secret) and the active mode
// are passed in via an `ApiAuth` value instead of being read out of input
// elements, so the same client works from React, tests, or any caller that can
// supply the credentials it already holds.

import { API_BASE, type Mode } from "./config";

export interface ApiAuth {
  clientId: string;
  clientSecret: string;
  mode: Mode;
}

// Fail a stalled request instead of spinning forever — a guided op that hangs
// server-side surfaces as a clear timeout rather than an indefinite wait.
const REQUEST_TIMEOUT_MS = 30_000;

export function resolveMode(value: string | undefined): Mode {
  return value === "production" ? "production" : "sandbox";
}

function authHeader(auth: ApiAuth): string {
  return "Basic " + btoa(`${auth.clientId.trim()}:${auth.clientSecret.trim()}`);
}

async function timedFetch(path: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(API_BASE + path, { ...init, signal: controller.signal });
  } catch (err) {
    if (controller.signal.aborted)
      throw new Error(
        `Request to ${path} timed out after ${REQUEST_TIMEOUT_MS / 1000}s.`,
      );
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export async function apiPost(
  auth: ApiAuth,
  path: string,
  body: Record<string, unknown> | undefined,
  extraHeaders: Record<string, string> = {},
): Promise<{ status: number; data: unknown }> {
  const res = await timedFetch(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader(auth),
      ...extraHeaders,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const raw = await res.text();
  const data = raw ? JSON.parse(raw) : null;
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${raw}`);
  return { status: res.status, data };
}

export async function apiDelete(
  auth: ApiAuth,
  path: string,
  extraHeaders: Record<string, string> = {},
): Promise<{ status: number; data: unknown }> {
  const res = await timedFetch(path, {
    method: "DELETE",
    headers: {
      Authorization: authHeader(auth),
      ...extraHeaders,
    },
  });
  const raw = await res.text();
  const data = raw ? JSON.parse(raw) : null;
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${raw}`);
  return { status: res.status, data };
}

export async function apiPatch(
  auth: ApiAuth,
  path: string,
  body: Record<string, unknown>,
  extraHeaders: Record<string, string> = {},
): Promise<{ status: number; data: unknown }> {
  const res = await timedFetch(path, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader(auth),
      ...extraHeaders,
    },
    body: JSON.stringify(body),
  });
  const raw = await res.text();
  const data = raw ? JSON.parse(raw) : null;
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${raw}`);
  return { status: res.status, data };
}

export async function apiGet(auth: ApiAuth, path: string): Promise<unknown> {
  const res = await timedFetch(path, {
    headers: { Authorization: authHeader(auth) },
  });
  const raw = await res.text();
  const data = raw ? JSON.parse(raw) : null;
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${raw}`);
  return data;
}
