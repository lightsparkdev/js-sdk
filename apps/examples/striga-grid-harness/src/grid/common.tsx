import { Field, Input, Textarea } from "@lightsparkdev/origin";

import type { CallFn } from "../sca/scaApi";

export type { CallFn };

export function TextField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
}) {
  return (
    <Field.Root>
      <Field.Label>{label}</Field.Label>
      <Input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field.Root>
  );
}

export function JsonField({
  label,
  value,
  onChange,
  rows = 8,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  rows?: number;
}) {
  return (
    <Field.Root>
      <Field.Label>{label}</Field.Label>
      <Textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field.Root>
  );
}

// Grid returns ids under a few different keys depending on the object; pull the
// first that is present so a follow-up step (get/delete) can be prefilled.
export function pickId(json: unknown): string | null {
  if (!json || typeof json !== "object") return null;
  const rec = json as Record<string, unknown>;
  for (const k of [
    "id",
    "externalAccountId",
    "verificationId",
    "transactionId",
  ]) {
    const v = rec[k];
    if (typeof v === "string" && v) return v;
  }
  return null;
}
