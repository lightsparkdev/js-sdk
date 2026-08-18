import { jest } from "@jest/globals";
import { act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

type Row = {
  id: string;
};

describe("DataManagerTable pagination", () => {
  test("does not reuse an old cursor after a page-size request fails", async () => {
    const getComputedStyle = window.getComputedStyle.bind(window);
    jest
      .spyOn(window, "getComputedStyle")
      .mockImplementation((element, pseudoElement) => {
        const style = getComputedStyle(element);
        if (pseudoElement) {
          Object.defineProperty(style, "content", { value: '"md"' });
        }
        return style;
      });
    let rejectRefetch: ((error: Error) => void) | undefined;
    const refetch = jest.fn(
      () =>
        new Promise<unknown>((_, reject) => {
          rejectRefetch = reject;
        }),
    );
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <DataManagerTable<Row, { first: number }, unknown>
          columns={[{ accessorKey: "id", header: "ID" }]}
          data={[{ id: "one" }, { id: "two" }, { id: "three" }]}
          filterOptions={{
            filters: [],
            getFilterQueryVariables: (_filters, _filterStates, pageSize) => ({
              first: pageSize,
            }),
            initialQueryVariables: { first: 3 },
            refetch,
          }}
          nextPageCursor="cursor-3"
          pageSizes={[3, 10]}
          paginationDisplayOptions={{
            pageSizeStringTemplate: "{pageSize} rows per page",
            showPageNumberButtons: true,
            showPaginationPreviousNext: false,
          }}
          resultCount={12}
        />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "2" })).toBeEnabled();
    });
    await user.click(screen.getByRole("button", { name: "3 rows per page" }));
    await user.click(await screen.findByText("10"));
    await waitFor(() => {
      expect(refetch).toHaveBeenCalledWith({ first: 10 });
    });

    await act(async () => {
      rejectRefetch?.(new Error("Request failed."));
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "2" })).toBeDisabled();
    });
  });
});
