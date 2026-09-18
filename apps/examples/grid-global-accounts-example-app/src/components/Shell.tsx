import styled from "@emotion/styled";
import { Badge, Logo } from "@lightsparkdev/origin";
import { type ReactNode } from "react";

import { useAppState } from "../state/store";
import { ContextChip } from "./ContextChip";
import { DebugDrawer } from "./DebugDrawer";
import { DebugToggle } from "./DebugToggle";
import { PersonaSwitcher } from "./PersonaSwitcher";

/**
 * App frame: a sticky top bar (brand · persona switcher · debug toggle) over
 * a centered content column. View routing happens in `App`; the Shell only
 * owns the chrome so each persona view can stay focused on its own content.
 */
export function Shell({ children }: { children: ReactNode }) {
  const { persona, debugOn } = useAppState();

  return (
    <Page data-debug={debugOn || undefined}>
      <TopBar>
        <Brand>
          <Logo brand="grid" variant="logo" height={20} aria-label="Grid" />
          <BrandDivider aria-hidden />
          <BrandLabel>Global Accounts</BrandLabel>
        </Brand>

        <SwitcherSlot>
          <PersonaSwitcher />
        </SwitcherSlot>

        <Controls>
          <ContextChip />
          <PersonaBadge
            variant={persona === "platform" ? "purple" : "blue"}
            vibrant
          >
            {persona === "platform" ? "Platform" : "Customer"}
          </PersonaBadge>
          <DebugToggle />
        </Controls>
      </TopBar>

      <Content data-debug={debugOn || undefined}>
        <Column>{children}</Column>
      </Content>

      {/* Docked dev console — renders only when debugOn, spans both personas. */}
      <DebugDrawer />
    </Page>
  );
}

const Page = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--surface-base, #f5f5f7);
  color: var(--text-primary, #1a1a1a);
  font-family: var(--font-family-sans);
`;

const TopBar = styled.header`
  position: sticky;
  top: 0;
  z-index: 10;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: var(--spacing-md, 16px);
  padding: var(--spacing-sm, 12px) var(--spacing-lg, 24px);
  background: var(--surface-primary, #fff);
  border-bottom: var(--stroke-xs, 1px) solid var(--border-primary, #e6e6e9);
  backdrop-filter: saturate(180%) blur(8px);
`;

const Brand = styled.div`
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs, 8px);
  min-width: 0;
`;

const BrandDivider = styled.span`
  width: var(--stroke-xs, 1px);
  height: 18px;
  background: var(--border-primary, #e6e6e9);
`;

const BrandLabel = styled.span`
  font-size: var(--font-size-sm, 13px);
  font-weight: var(--font-weight-medium, 500);
  color: var(--text-secondary, #555);
  white-space: nowrap;
  letter-spacing: -0.1px;
`;

const SwitcherSlot = styled.div`
  display: flex;
  justify-content: center;
`;

const Controls = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--spacing-md, 16px);
`;

const PersonaBadge = styled(Badge)`
  /* Hidden on narrow widths; the switcher already names the persona. */
  @media (width <= 640px) {
    display: none;
  }
`;

const Content = styled.main`
  flex: 1;
  display: flex;
  justify-content: center;
  padding: var(--spacing-2xl, 40px) var(--spacing-lg, 24px)
    var(--spacing-4xl, 64px);

  /* Reserve room for the docked debug console so it never hides content; the
     console's body scrolls internally, so the collapsed-bar clearance is enough. */
  &[data-debug] {
    padding-bottom: var(--spacing-9xl, 96px);
  }
`;

const Column = styled.div`
  width: 100%;
  max-width: 920px;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg, 24px);
`;
