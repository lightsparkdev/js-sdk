import styled from "@emotion/styled";
import {
  Button,
  Input,
  Select,
  type ButtonProps,
  type InputProps,
} from "@lightsparkdev/origin";
import { useState } from "react";

// Non-primary actions (fetch, refresh, load, clear). Ghost buttons read as
// plain text until hovered, so these keep a visible keyline at rest.
export function SecondaryButton(props: ButtonProps) {
  return <Button variant="outline" {...props} />;
}

export function SelectControl({
  value,
  onValueChange,
  items,
  mutedValues,
}: {
  value: string;
  onValueChange: (next: string) => void;
  items: { value: string; label: string }[];
  /** Values rendered greyed out, for "not sent" style sentinels. */
  mutedValues?: readonly string[];
}) {
  const isMuted = (v: string) => mutedValues?.includes(v) ?? false;
  return (
    <Select.Root
      value={value}
      onValueChange={(next) => {
        if (next != null) onValueChange(next);
      }}
    >
      <Select.Trigger>
        <Select.Value>
          {(v: string) => (
            <MutedWhen $muted={isMuted(v)}>
              {items.find((i) => i.value === v)?.label ?? v}
            </MutedWhen>
          )}
        </Select.Value>
        <Select.Icon />
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner>
          <Select.Popup>
            <Select.List>
              {items.map((item) => (
                <Select.Item key={item.value} value={item.value}>
                  <Select.ItemIndicator />
                  <Select.ItemText>
                    <MutedWhen $muted={isMuted(item.value)}>
                      {item.label}
                    </MutedWhen>
                  </Select.ItemText>
                </Select.Item>
              ))}
            </Select.List>
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  );
}

export const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md, 12px);
`;

export const ButtonRow = styled.div`
  display: flex;
  gap: var(--spacing-sm, 8px);
  flex-wrap: wrap;
`;

export const SectionLabel = styled.div`
  margin-top: var(--spacing-sm, 8px);
  font-size: var(--font-size-xs, 12px);
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: var(--text-secondary, #666);
  font-weight: var(--font-weight-medium, 500);
`;

export const Divider = styled.hr`
  border: none;
  border-top: var(--stroke-xs, 1px) solid var(--border-primary, #e0e0e0);
  margin: var(--spacing-sm, 8px) 0;
`;

export const ResultPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm, 8px);
  padding: var(--spacing-md, 12px);
  background: var(--surface-primary, #fff);
  border: var(--stroke-xs, 1px) solid var(--border-primary, #e0e0e0);
  border-radius: var(--corner-radius-md, 8px);
`;

export const ResultMeta = styled.div`
  display: flex;
  gap: var(--spacing-xs, 4px);
  flex-wrap: wrap;
`;

const MutedWhen = styled.span<{ $muted: boolean }>`
  color: ${(p) => (p.$muted ? "var(--text-tertiary, #989898)" : "inherit")};
  font-style: ${(p) => (p.$muted ? "italic" : "normal")};
`;

/**
 * Text input whose value may be a sentinel meaning "already on file, not
 * re-sent". The sentinel is never shown as editable text: the box renders
 * empty with the sentinel as a grey placeholder, typing replaces it, and
 * leaving the box empty restores it.
 */
export function OmittableInput({
  value,
  sentinel,
  onValueChange,
  placeholder,
  ...rest
}: Omit<InputProps, "value" | "onChange" | "placeholder"> & {
  value: string;
  sentinel: string;
  onValueChange: (next: string) => void;
  placeholder?: string;
}) {
  const [editing, setEditing] = useState(false);
  const omitted = value === sentinel;
  return (
    <Input
      {...rest}
      value={omitted ? "" : value}
      placeholder={omitted && !editing ? sentinel : placeholder}
      onFocus={() => setEditing(true)}
      onChange={(e) => onValueChange(e.target.value)}
      onBlur={() => {
        setEditing(false);
        if (!value.trim()) onValueChange(sentinel);
      }}
      style={omitted ? { fontStyle: "italic" } : undefined}
    />
  );
}
