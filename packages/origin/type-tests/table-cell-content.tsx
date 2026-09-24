import { Table } from "../src";
import { type CellContentProps } from "../src/components/Table";

interface WrappedCellContentProps extends CellContentProps {
  analyticsName?: string;
}

function WrappedCellContent({
  analyticsName: _analyticsName,
  ...props
}: WrappedCellContentProps) {
  return <Table.CellContent {...props} />;
}

<WrappedCellContent
  analyticsName="wrapped-cell"
  bounded
  label="Account name"
  description="Account description"
/>;

<Table.CellContent
  bounded
  label={<button type="button">Interactive value</button>}
/>;
