import styled from "@emotion/styled";
import { Select } from "@lightsparkdev/origin";

export function SelectControl({
  value,
  onValueChange,
  items,
}: {
  value: string;
  onValueChange: (next: string) => void;
  items: { value: string; label: string }[];
}) {
  return (
    <Select.Root
      value={value}
      onValueChange={(next) => {
        if (next != null) onValueChange(next);
      }}
    >
      <Select.Trigger>
        <Select.Value>
          {(v: string) => items.find((i) => i.value === v)?.label ?? v}
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
                  <Select.ItemText>{item.label}</Select.ItemText>
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
