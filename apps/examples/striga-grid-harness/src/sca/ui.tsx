// Shared presentational primitives for the SCA panels. Mirrors the styled tokens
// App.tsx uses for its own panels so the two sections read as one tool. Response
// detail lives in the right-column request/response log; panels keep only the
// inputs, actions, and the few captured values a follow-up step needs.

import styled from "@emotion/styled";
import { Card, Select } from "@lightsparkdev/origin";
import type { ReactNode } from "react";

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
