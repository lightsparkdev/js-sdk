import styled from "@emotion/styled";
import { Switch } from "@lightsparkdev/origin";

import { useAppState } from "../state/store";

/**
 * Top-bar control that flips the app between the two polished personas
 * (off) and the dev-tools view that surfaces the request/response log and
 * raw IDs (on). Defaults to off — the store seeds `debugOn = false`.
 */
export function DebugToggle() {
  const { debugOn, toggleDebug } = useAppState();

  return (
    <Root>
      <Label htmlFor="debug-toggle" data-active={debugOn}>
        Debug
      </Label>
      <Switch
        id="debug-toggle"
        size="sm"
        checked={debugOn}
        onCheckedChange={toggleDebug}
        aria-label="Toggle debug mode"
      />
    </Root>
  );
}

const Root = styled.div`
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs, 8px);
`;

const Label = styled.label`
  font-size: var(--font-size-xs, 12px);
  font-weight: var(--font-weight-medium, 500);
  letter-spacing: 0.4px;
  text-transform: uppercase;
  color: var(--text-tertiary, #8a8a8a);
  cursor: pointer;
  transition: color 120ms ease;
  user-select: none;

  &[data-active="true"] {
    color: var(--text-primary, #1a1a1a);
  }
`;
