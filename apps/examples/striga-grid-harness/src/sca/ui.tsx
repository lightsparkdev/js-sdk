// Shared presentational primitives for the SCA panels. Mirrors the styled tokens
// App.tsx uses for its own panels so the two sections read as one tool. Response
// detail lives in the right-column request/response log; panels keep only the
// inputs, actions, and the few captured values a follow-up step needs.

import styled from "@emotion/styled";
import {
  Button,
  Card,
  CentralIcon,
  Select,
  Tooltip,
} from "@lightsparkdev/origin";
import { useEffect, useRef, useState, type ReactNode } from "react";

const COPIED_RESET_MS = 1500;

export function Panel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <Card.Root variant="structured">
      <Card.Header>
        <Card.TitleGroup>
          <Card.Title>{title}</Card.Title>
          {subtitle && <Card.Subtitle>{subtitle}</Card.Subtitle>}
        </Card.TitleGroup>
      </Card.Header>
      <Card.Body>
        <PanelBody>{children}</PanelBody>
      </Card.Body>
    </Card.Root>
  );
}

export function EnumSelect({
  value,
  onValueChange,
  options,
}: {
  value: string;
  onValueChange: (next: string) => void;
  options: readonly string[];
}) {
  return (
    <Select.Root
      value={value}
      onValueChange={(next) => {
        if (next != null) onValueChange(String(next));
      }}
    >
      <Select.Trigger>
        <Select.Value>{(v: string) => v || "—"}</Select.Value>
        <Select.Icon />
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner>
          <Select.Popup>
            <Select.List>
              {options.map((opt) => (
                <Select.Item key={opt} value={opt}>
                  <Select.ItemIndicator />
                  <Select.ItemText>{opt}</Select.ItemText>
                </Select.Item>
              ))}
            </Select.List>
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  );
}

type CopyResult = { value: string; outcome: "copied" | "failed" };

const COPY_FEEDBACK = {
  idle: { label: "Copy", icon: "IconSquareBehindSquare1" },
  copied: { label: "Copied", icon: "IconCheckmark2Small" },
  failed: { label: "Copy failed", icon: "IconCrossSmall" },
} as const;

export function CopyableId({ value }: { value?: string | null }) {
  const [result, setResult] = useState<CopyResult | null>(null);
  const latestAttempt = useRef(0);

  useEffect(() => {
    if (!result) return;
    const t = setTimeout(() => setResult(null), COPIED_RESET_MS);
    return () => clearTimeout(t);
  }, [result]);

  if (!value) return <Mono>—</Mono>;

  const { label, icon } =
    COPY_FEEDBACK[result?.value === value ? result.outcome : "idle"];
  return (
    <CopyableRow>
      <TruncatedMono title={value}>{value}</TruncatedMono>
      <Tooltip.Root>
        <Tooltip.Trigger
          render={
            <Button
              variant="ghost"
              size="dense"
              iconOnly
              aria-label={`${label} ${value}`}
              onClick={() => {
                const attempt = ++latestAttempt.current;
                const settle = (outcome: CopyResult["outcome"]) => {
                  if (attempt === latestAttempt.current) {
                    setResult({ value, outcome });
                  }
                };
                void Promise.resolve()
                  .then(() => navigator.clipboard.writeText(value))
                  .then(
                    () => settle("copied"),
                    () => settle("failed"),
                  );
              }}
            >
              <CentralIcon name={icon} size={14} />
            </Button>
          }
        />
        <Tooltip.Portal>
          <Tooltip.Positioner sideOffset={6}>
            <Tooltip.Popup>{label}</Tooltip.Popup>
          </Tooltip.Positioner>
        </Tooltip.Portal>
      </Tooltip.Root>
    </CopyableRow>
  );
}

const PanelBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm, 12px);
`;

export const ButtonRow = styled.div`
  display: flex;
  gap: var(--spacing-xs, 8px);
  flex-wrap: wrap;
`;

export const Note = styled.div`
  font-size: var(--font-size-xs, 12px);
  color: var(--text-secondary, #666);
  line-height: 1.5;
`;

export const Mono = styled.span`
  font-family: var(--font-family-mono);
  font-size: var(--font-size-xs, 12px);
  word-break: break-all;
  color: var(--text-primary);
`;

export const Pre = styled.pre`
  margin: 0;
  padding: var(--spacing-xs, 8px);
  font-family: var(--font-family-mono);
  font-size: var(--font-size-xs, 11px);
  white-space: pre-wrap;
  word-break: break-word;
  background: var(--surface-secondary, #f5f5f5);
  border-radius: var(--corner-radius-sm, 6px);
  max-height: 240px;
  overflow: auto;
`;

const CopyableRow = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 2px;
  max-width: 100%;
  min-width: 0;
  vertical-align: middle;
`;

const TruncatedMono = styled(Mono)`
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  word-break: normal;
`;
