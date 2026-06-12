// HTTP client + auth header + mode resolution.

import { API_BASE, type Mode } from "./config";
import { el } from "./ui";

let authClientId: HTMLInputElement | null = null;
let authClientSecret: HTMLInputElement | null = null;
let modeSelect: HTMLSelectElement | null = null;

function getAuthClientId(): HTMLInputElement {
  if (!authClientId) authClientId = el<HTMLInputElement>("auth-client-id");
  return authClientId;
}

function getAuthClientSecret(): HTMLInputElement {
  if (!authClientSecret)
    authClientSecret = el<HTMLInputElement>("auth-client-secret");
  return authClientSecret;
}

function getModeSelect(): HTMLSelectElement {
  if (!modeSelect) modeSelect = el<HTMLSelectElement>("mode-select");
  return modeSelect;
}

export function getMode(): Mode {
  return getModeSelect().value === "production" ? "production" : "sandbox";
}

function getAuthHeader(): string {
  return (
    "Basic " +
    btoa(
      `${getAuthClientId().value.trim()}:${getAuthClientSecret().value.trim()}`,
    )
  );
}

export async function apiPost(
  path: string,
  body: Record<string, unknown> | undefined,
  extraHeaders: Record<string, string> = {},
): Promise<{ status: number; data: unknown }> {
  const res = await fetch(API_BASE + path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: getAuthHeader(),
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
  path: string,
  extraHeaders: Record<string, string> = {},
): Promise<{ status: number; data: unknown }> {
  const res = await fetch(API_BASE + path, {
    method: "DELETE",
    headers: {
      Authorization: getAuthHeader(),
      ...extraHeaders,
    },
  });
  const raw = await res.text();
  const data = raw ? JSON.parse(raw) : null;
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${raw}`);
  return { status: res.status, data };
}

export async function apiPatch(
  path: string,
  body: Record<string, unknown>,
  extraHeaders: Record<string, string> = {},
): Promise<{ status: number; data: unknown }> {
  const res = await fetch(API_BASE + path, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: getAuthHeader(),
      ...extraHeaders,
    },
    body: JSON.stringify(body),
  });
  const raw = await res.text();
  const data = raw ? JSON.parse(raw) : null;
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${raw}`);
  return { status: res.status, data };
}

export async function apiGet(path: string): Promise<unknown> {
  const res = await fetch(API_BASE + path, {
    headers: { Authorization: getAuthHeader() },
  });
  const raw = await res.text();
  const data = raw ? JSON.parse(raw) : null;
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${raw}`);
  return data;
}
