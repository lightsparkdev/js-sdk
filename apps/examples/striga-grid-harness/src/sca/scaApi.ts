// Path helpers for the Striga SCA endpoints. Customer identity differs by
// surface: every /sca/* endpoint takes a required ?customerId=; quote-authorize
// keys off quoteId; beneficiary trust keys off externalAccountId. Neither of the
// latter two accepts customerId. All calls go through the existing /grid/* proxy.

// apiPrefixValue is read per call, not captured: environments do not all serve the
// same Grid API version prefix, and the settings panel can change it at runtime.
import { apiPrefixValue, type CallResult, type HttpMethod } from "../api";

export type CallFn = <T,>(
  method: HttpMethod,
  path: string,
  body?: unknown,
) => Promise<CallResult<T>>;

export interface ScaPanelProps {
  call: CallFn;
  customerId: string;
  code: string;
}

// <prefix>/sca<suffix>?customerId=<id>. `suffix` starts with "/".
export function scaPath(suffix: string, customerId: string): string {
  const sep = suffix.includes("?") ? "&" : "?";
  return `${apiPrefixValue()}/sca${suffix}${sep}customerId=${encodeURIComponent(customerId)}`;
}

export function quotePath(quoteId: string, suffix = ""): string {
  return `${apiPrefixValue()}/quotes/${encodeURIComponent(quoteId)}${suffix}`;
}

export function externalAccountPath(
  externalAccountId: string,
  suffix: string,
): string {
  return `${apiPrefixValue()}/customers/external-accounts/${encodeURIComponent(
    externalAccountId,
  )}${suffix}`;
}

export const SCA_FACTORS = ["SMS_OTP", "TOTP", "PASSKEY"] as const;
export type ScaFactorValue = (typeof SCA_FACTORS)[number];
