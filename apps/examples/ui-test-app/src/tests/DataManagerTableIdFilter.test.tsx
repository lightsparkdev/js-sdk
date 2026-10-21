import { jest } from "@jest/globals";
import { screen, waitFor } from "@testing-library/react";
import userEvent, {
  PointerEventsCheckLevel,
} from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { render } from "./render";

jest.unstable_mockModule("react-date-picker", () => ({
  default: () => null,
}));
jest.unstable_mockModule("react-datetime-picker", () => ({
  default: () => null,
}));
jest.unstable_mockModule("@wojtekmaj/react-daterange-picker", () => ({
  default: () => null,
}));
jest.unstable_mockModule("@wojtekmaj/react-datetimerange-picker", () => ({
  default: () => null,
}));

const { DataManagerTable } = await import(
  "@lightsparkdev/ui/components/DataManagerTable/DataManagerTable"
);
const { FilterType } = await import(
  "@lightsparkdev/ui/components/DataManagerTable/filters"
);

type Row = { id: string };
type Variables = { ids: string[] | null };

const UUID = "018c60f0-c0b7-88df-0000-102a3d988985";
const ERROR_MESSAGE = "Enter a Node ID.";

describe("DataManagerTable ID filter", () => {
  beforeAll(() => {
    global.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  });

  async function applyPillFilter(pastedId: string) {
    const refetch = jest.fn((_variables: Variables) => Promise.resolve({}));
    const user = userEvent.setup({
      pointerEventsCheck: PointerEventsCheckLevel.Never,
    });

    render(
      <MemoryRouter>
        <DataManagerTable<Row, Variables, unknown>
          showHeader
          enableURLFilters
          filterEditorStyle="pills"
          columns={[{ accessorKey: "id", header: "ID" }]}
          data={[]}
          pageSizes={[20]}
          filterOptions={{
            filters: [
              {
                type: FilterType.ID,
                label: "Node ID",
                accessorKey: "id",
                queryVariable: "ids",
                allowedEntities: ["Node"],
                isMulti: true,
                errorMessage: ERROR_MESSAGE,
              },
            ],
            getFilterQueryVariables: (_filters, filterStates) => {
              const state = filterStates.id as {
                isApplied: boolean;
                appliedValues?: string[];
              };
              return {
                ids: state.isApplied ? state.appliedValues ?? null : null,
              };
            },
            initialQueryVariables: { ids: null },
            refetch,
          }}
        />
      </MemoryRouter>,
    );

    await user.click(screen.getByText("Filter"));
    await user.click(await screen.findByText("Node ID"));
    await user.click(await screen.findByText("Empty"));
    await user.click(await screen.findByPlaceholderText("Enter value"));
    await user.paste(pastedId);
    await user.click(screen.getByText("Apply"));

    return refetch;
  }

  test("applies an ID with an allowed entity prefix", async () => {
    const refetch = await applyPillFilter(`Node:${UUID}`);

    await waitFor(() => {
      expect(refetch).toHaveBeenLastCalledWith({ ids: [UUID] });
    });
  });

  test("does not duplicate a reapplied ID", async () => {
    const user = userEvent.setup({
      pointerEventsCheck: PointerEventsCheckLevel.Never,
    });
    const refetch = await applyPillFilter(`Node:${UUID}`);
    await waitFor(() => {
      expect(refetch).toHaveBeenLastCalledWith({ ids: [UUID] });
    });

    await user.click(screen.getByText(UUID));
    const input = await screen.findByPlaceholderText("Enter value");
    await user.clear(input);
    await user.paste(`Node:${UUID}`);
    await user.click(screen.getByText("Apply"));

    await waitFor(() => {
      expect(refetch).toHaveBeenCalledTimes(2);
    });
    expect(refetch).toHaveBeenLastCalledWith({ ids: [UUID] });
  });

  test("shows an error instead of applying an ID without an allowed prefix", async () => {
    const refetch = await applyPillFilter(UUID);

    expect(await screen.findByText(ERROR_MESSAGE)).toBeInTheDocument();
    expect(refetch).not.toHaveBeenCalled();
  });
});
