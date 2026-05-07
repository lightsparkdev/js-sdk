import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { Pager } from "./Pager";
import { Pagination } from "../Pagination";

interface Cursor {
  prev: string | null;
  next: string | null;
}

const PAGES: Cursor[] = [
  { prev: null, next: "p2" },
  { prev: "p1", next: "p3" },
  { prev: "p2", next: "p4" },
  { prev: "p3", next: null },
];

function PagerDemo({
  hasPrevious: hasPreviousProp,
  hasNext: hasNextProp,
  withStatus = true,
}: {
  hasPrevious?: boolean;
  hasNext?: boolean;
  withStatus?: boolean;
}) {
  const [index, setIndex] = React.useState(1);
  const cursor = PAGES[index];
  const hasPrevious = hasPreviousProp ?? cursor.prev !== null;
  const hasNext = hasNextProp ?? cursor.next !== null;

  return (
    <Pager.Root
      hasPrevious={hasPrevious}
      hasNext={hasNext}
      onPrevious={() => setIndex((i) => Math.max(0, i - 1))}
      onNext={() => setIndex((i) => Math.min(PAGES.length - 1, i + 1))}
    >
      {withStatus ? (
        <Pager.Status>
          Page {index + 1} of {PAGES.length}
        </Pager.Status>
      ) : null}
      <Pager.Navigation>
        <Pager.Previous />
        <Pager.Next />
      </Pager.Navigation>
    </Pager.Root>
  );
}

const meta: Meta<typeof Pager.Root> = {
  title: "Components/Pager",
  component: Pager.Root,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    hasPrevious: { control: { type: "boolean" } },
    hasNext: { control: { type: "boolean" } },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <PagerDemo />,
};

export const NoPreviousCursor: Story = {
  render: () => <PagerDemo hasPrevious={false} hasNext />,
};

export const NoNextCursor: Story = {
  render: () => <PagerDemo hasPrevious hasNext={false} />,
};

export const BothEdges: Story = {
  render: () => (
    <Pager.Root hasPrevious={false} hasNext={false}>
      <Pager.Status>No results</Pager.Status>
      <Pager.Navigation>
        <Pager.Previous />
        <Pager.Next />
      </Pager.Navigation>
    </Pager.Root>
  ),
};

export const WithoutStatus: Story = {
  render: () => <PagerDemo withStatus={false} />,
};

export const WithRenderPropAsLink: Story = {
  render: () => (
    <Pager.Root hasPrevious hasNext>
      <Pager.Navigation>
        <Pager.Previous render={<a href="?before=p1" />} />
        <Pager.Next render={<a href="?after=p2" />} />
      </Pager.Navigation>
    </Pager.Root>
  ),
};

export const SideBySideWithPagination: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <Pager.Root hasPrevious hasNext>
        <Pager.Status>Showing 25 results</Pager.Status>
        <Pager.Navigation>
          <Pager.Previous />
          <Pager.Next />
        </Pager.Navigation>
      </Pager.Root>
      <Pagination.Root page={5} totalItems={1000} pageSize={100}>
        <Pagination.Range />
        <Pagination.Navigation>
          <Pagination.Previous />
          <Pagination.Next />
        </Pagination.Navigation>
      </Pagination.Root>
    </div>
  ),
};
