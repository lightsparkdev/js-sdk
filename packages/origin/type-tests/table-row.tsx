import { Table } from "../src";

<Table.Row />;

<Table.Row
  onClick={(event) => {
    event.preventDefault();
    event.currentTarget.dataset.clicked = "true";
  }}
/>;

declare const navigate: (path: string) => void;
declare const row: { id: string };

// @ts-expect-error Activated rows require an accessible action label.
<Table.Row onActivate={() => navigate(`/rows/${row.id}`)} />;

<Table.Row
  activationLabel="Open row"
  onActivate={() => navigate(`/rows/${row.id}`)}
/>;

// Public consumers such as Ops PaginatedTable conditionally spread this
// native click-only shape onto rows and rely on Table.Row for keyboard parity.
<Table.Row
  {...{
    onClick: () => navigate(`/rows/${row.id}`),
    style: { cursor: "pointer" },
  }}
/>;
