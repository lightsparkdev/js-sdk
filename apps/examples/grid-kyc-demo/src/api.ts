// Grid REST API helpers for the demo. Pure module — all UI state lives in
// React; this just owns the env -> proxy-prefix mapping, basic auth header,
// request/response shape, and the request log records.

export type GridEnv = "prod" | "dev" | "local";

export type CustomerType = "INDIVIDUAL" | "BUSINESS";

// Sentinel for "exclude from payload" — can't be "" or NONE (PepStatus has a real NONE).
export const OMIT = "OMIT";

export interface GridCredentials {
  id: string;
  secret: string;
}

export const API_BASE: Record<GridEnv, string> = {
  prod: "/api/prod",
  dev: "/api/dev",
  local: "/api/local",
};

export const ENV_LABELS: Record<GridEnv, string> = {
  prod: "prod — api.lightspark.com/grid/2025-10-13",
  dev: "dev — api.dev.dev.sparkinfra.net/grid/rc",
  local: "local — localhost:5000/grid/rc",
};

export interface CustomerCreateResponse {
  id: string;
  customerType: CustomerType;
  platformCustomerId: string;
  kycStatus?: string;
  kybStatus?: string;
  [key: string]: unknown;
}

export interface KycLinkResponse {
  kycUrl: string;
  expiresAt: string;
  provider: string;
  token?: string;
}

export interface VerificationErrorItem {
  resourceId: string;
  type: string;
  field?: string;
  acceptedDocumentTypes?: string[];
  reason: string;
}

export interface Verification {
  id: string;
  customerId: string;
  verificationStatus: string;
  errors: VerificationErrorItem[];
  createdAt: string;
  updatedAt?: string;
}

export interface VerificationListResponse {
  data: Verification[];
  nextCursor?: string;
}

export interface BeneficialOwnerResponse {
  id: string;
  customerId: string;
  roles: string[];
  ownershipPercentage?: number;
  personalInfo?: {
    firstName?: string;
    lastName?: string;
  };
  [key: string]: unknown;
}

export interface DocumentResponse {
  id: string;
  documentType: string;
  documentHolder: string;
  [key: string]: unknown;
}

export interface LogEntry {
  id: number;
  ts: string;
  env: GridEnv;
  method: string;
  path: string;
  requestBody?: unknown;
  status?: number;
  responseBody?: unknown;
  error?: string;
}

function authHeader(creds: GridCredentials): string {
  return "Basic " + btoa(`${creds.id.trim()}:${creds.secret.trim()}`);
}

export type GridMethod = "GET" | "POST" | "PATCH" | "PUT";

export interface CallOptions {
  env: GridEnv;
  creds: GridCredentials;
  method: GridMethod;
  path: string;
  body?: unknown;
  // No explicit Content-Type when set — the browser must generate the multipart boundary.
  formData?: FormData;
}

export type RunCall = <T>(
  method: GridMethod,
  path: string,
  body?: unknown,
  formData?: FormData,
) => Promise<T | null>;

export interface CallResult<T> {
  status: number;
  data: T;
}

export async function callGrid<T = unknown>(
  opts: CallOptions,
): Promise<CallResult<T>> {
  if (!opts.creds.id.trim() || !opts.creds.secret.trim()) {
    throw new Error("Set API Client ID and Secret first.");
  }
  const init: RequestInit = {
    method: opts.method,
    headers: {
      Authorization: authHeader(opts.creds),
      ...(opts.body ? { "Content-Type": "application/json" } : {}),
    },
  };
  if (opts.formData) init.body = opts.formData;
  else if (opts.body) init.body = JSON.stringify(opts.body);
  const res = await fetch(API_BASE[opts.env] + opts.path, init);
  const text = await res.text();
  let data: unknown = text;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    // leave as text
  }
  if (!res.ok) {
    const message =
      (data as { message?: string })?.message ||
      (data as { error?: string })?.error ||
      `HTTP ${res.status}`;
    const err = new Error(message);
    (err as Error & { status?: number; body?: unknown }).status = res.status;
    (err as Error & { status?: number; body?: unknown }).body = data;
    throw err;
  }
  return { status: res.status, data: data as T };
}

export function nowTs(): string {
  return new Date().toISOString().slice(11, 19);
}

export function randomSuffix(): string {
  return Math.random().toString(36).slice(2, 10);
}
