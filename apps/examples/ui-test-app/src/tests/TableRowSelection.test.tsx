import { jest } from "@jest/globals";
import { Table } from "@lightsparkdev/ui/components/Table/Table";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { render } from "./render";

type Row = {
  id: string;
  actionable: boolean;
};

describe("Table row selection", () => {
  test("selects only eligible rows", async () => {
    const onSelectedRowIdsChange = jest.fn();
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <Table<Row>
          columns={[{ accessorKey: "id", header: "ID" }]}
          data={[
            { id: "live", actionable: true },
            { id: "cached", actionable: false },
          ]}
          rowSelection={{
            selectedRowIds: [],
            onSelectedRowIdsChange,
            getRowId: (row) => row.id,
            isRowSelectable: (row) => row.actionable,
          }}
        />
      </MemoryRouter>,
    );

    const [selectAll, liveRow, cachedRow] = screen.getAllByRole("checkbox");
    expect(selectAll).toBeEnabled();
    expect(liveRow).toBeEnabled();
    expect(cachedRow).toBeDisabled();

    await user.click(selectAll);

    expect(onSelectedRowIdsChange).toHaveBeenCalledWith(["live"]);
  });
});
