// Real SMS codes arrive on the customer's phone. The presets are the fixed codes
// each sandbox accepts.

import styled from "@emotion/styled";
import { Button, Field, Input } from "@lightsparkdev/origin";

export const SANDBOX_OTP_PRESETS = [
  { code: "123456", label: "Striga sandbox" },
  { code: "000000", label: "Grid sandbox" },
] as const;

export function normalizeOtpCode(raw: string): string {
  return raw.replace(/[\s-]/g, "");
}

export function OtpCodeField({
  value,
  onChange,
  label = "SMS code",
}: {
  value: string;
  onChange: (next: string) => void;
  label?: string;
}) {
  return (
    <Field.Root>
      <Field.Label>{label}</Field.Label>
      <CodeRow>
        <CodeInput>
          <Input
            value={value}
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="code from the SMS"
            onChange={(e) => onChange(e.target.value)}
          />
        </CodeInput>
        {SANDBOX_OTP_PRESETS.map((p) => (
          <Button
            key={p.code}
            variant="ghost"
            size="compact"
            title={`Use the ${p.label} code`}
            onClick={() => onChange(p.code)}
          >
            {p.code}
          </Button>
        ))}
      </CodeRow>
    </Field.Root>
  );
}

const CodeRow = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-xs, 8px);

  > button {
    flex: none;
  }
`;

const CodeInput = styled.div`
  flex: 1;
  min-width: 0;

  > input {
    width: 100%;
  }
`;
