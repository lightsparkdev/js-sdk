import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { Pagination } from "./Pagination";
import { Select } from "../Select";

function PaginationDemo({
  initialPage = 1,
  totalItems,
  initialPageSize,
  showSelect = true,
}: {
  initialPage?: number;
  totalItems: number;
  initialPageSize: number;
  showSelect?: boolean;
}) {
  const [page, setPage] = React.useState(initialPage);
  const [pageSize, setPageSize] = React.useState(initialPageSize);

  return (
    <Pagination.Root
      page={page}
      totalItems={totalItems}
      pageSize={pageSize}
      onPageChange={setPage}
    >
      <Pagination.Label />
      {showSelect && (
        <Select.Root
          value={String(pageSize)}
          onValueChange={(v) => setPageSize(Number(v))}
        >
          <Select.Trigger variant="ghost">
            <Select.Value />
            <Select.Icon />
          </Select.Trigger>
          <Select.Portal>
            <Select.Positioner>
              <Select.Popup>
                <Select.List>
                  <Select.Item value="10">
                    <Select.ItemText>10</Select.ItemText>
                  </Select.Item>
                  <Select.Item value="25">
                    <Select.ItemText>25</Select.ItemText>
                  </Select.Item>
                  <Select.Item value="50">
                    <Select.ItemText>50</Select.ItemText>
                  </Select.Item>
                  <Select.Item value="100">
                    <Select.ItemText>100</Select.ItemText>
                  </Select.Item>
                </Select.List>
              </Select.Popup>
            </Select.Positioner>
          </Select.Portal>
        </Select.Root>
      )}
      <Pagination.Range />
      <Pagination.Navigation>
        <Pagination.Previous />
        <Pagination.Next />
      </Pagination.Navigation>
    </Pagination.Root>
  );
}

const meta: Meta<typeof Pagination.Root> = {
  title: "Components/Pagination",
  component: Pagination.Root,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    totalItems: {
      control: { type: "number" },
    },
    pageSize: {
      control: { type: "number" },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Controlled: Story = {
  args: {
    totalItems: 2500,
    pageSize: 100,
  },
  render: (args) => (
    <PaginationDemo
      initialPage={1}
      totalItems={args.totalItems}
      initialPageSize={args.pageSize}
    />
  ),
};

export const WithoutSelect: Story = {
  args: {
    totalItems: 2500,
    pageSize: 100,
  },
  render: (args) => (
    <PaginationDemo
      initialPage={1}
      totalItems={args.totalItems}
      initialPageSize={args.pageSize}
      showSelect={false}
    />
  ),
};
