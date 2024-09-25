import styled from "@emotion/styled";
import { Icon } from "./Icon/Icon.js";

type Column<Key extends string = string> = {
  key: Key;
  title: string;
  titleTooltip?: string;
};

type InferRowType<Columns extends Column[]> = {
  [P in Columns[number]["key"]]: string | boolean;
} & {
  title: string;
  titleTooltip?: string;
};

export function ContentTable<Columns extends Column[]>({
  columns,
  rows,
}: {
  columns: Columns;
  rows: InferRowType<Columns>[];
}) {
  return (
    <StyledContentTable>
      <thead>
        <tr>
          <th />
          {columns.map((column) => (
            <th key={column.key}>{column.title}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => (
          <tr key={index}>
            <td>{row.title}</td>
            {columns.map((column) => {
              const value = row[column.key as Columns[number]["key"]];
              return (
                <td key={column.key}>
                  {value === true ? (
                    <Icon name="CheckmarkCircle" width={16} color="success" />
                  ) : (
                    value
                  )}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </StyledContentTable>
  );
}

export const StyledContentTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  border: 1px solid ${({ theme }) => theme.c1Neutral};
  color: ${({ theme }) => theme.c6Neutral};

  tr:last-child td:first-child {
    border-bottom-left-radius: 10px;
  }

  tr:last-child td:last-child {
    border-bottom-right-radius: 10px;
  }

  th,
  td {
    padding: 26px 12px;
    border: 1px solid #e5e5e5;
  }
  th {
    text-align: center;
  }
  td {
    vertical-align: middle;
    text-align: center;
  }
`;
