import styled from "@emotion/styled";

import { StatusBanner } from "../../components/StatusBanner";
import { Config } from "./Config";
import { CustomersTable } from "./CustomersTable";

/**
 * Platform view — the admin-dashboard side of a Grid integration.
 *
 * Composes the config / auth panel (the entry point) over the customers table
 * (create + "act as"). A transient status line surfaces the latest reporter
 * message so platform operations give feedback without opening the debug
 * drawer. Until the platform is connected, only the config panel is actionable.
 */
export function PlatformView() {
  return (
    <Stack>
      <StatusBanner />
      <Config />
      <CustomersTable />
    </Stack>
  );
}

const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg, 24px);
`;
