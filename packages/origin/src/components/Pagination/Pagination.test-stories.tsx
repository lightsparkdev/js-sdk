"use client";

import * as React from "react";
import { Pagination, usePaginationContext } from "./Pagination";
import { Select } from "../Select";

// Basic pagination with all parts
export function BasicPagination() {
  const [page, setPage] = React.useState(1);
  const pageSize = 100;
  const totalItems = 2500;

  return (
    <Pagination.Root
      page={page}
      totalItems={totalItems}
      pageSize={pageSize}
      onPageChange={setPage}
    >
      <Pagination.Label />
      <Select.Root value={String(pageSize)}>
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
      <Pagination.Range />
      <Pagination.Navigation>
        <Pagination.Previous />
        <Pagination.Next />
      </Pagination.Navigation>
    </Pagination.Root>
  );
}

// Pagination on first page (Previous disabled)
export function FirstPage() {
  return (
    <Pagination.Root page={1} totalItems={2500} pageSize={100}>
      <Pagination.Label />
      <Pagination.Range />
      <Pagination.Navigation>
        <Pagination.Previous />
        <Pagination.Next />
      </Pagination.Navigation>
    </Pagination.Root>
  );
}

// Pagination on last page (Next disabled)
export function LastPage() {
  return (
    <Pagination.Root page={25} totalItems={2500} pageSize={100}>
      <Pagination.Label />
      <Pagination.Range />
      <Pagination.Navigation>
        <Pagination.Previous />
        <Pagination.Next />
      </Pagination.Navigation>
    </Pagination.Root>
  );
}

// Single page (both nav buttons disabled)
export function SinglePage() {
  return (
    <Pagination.Root page={1} totalItems={50} pageSize={100}>
      <Pagination.Label />
      <Pagination.Range />
      <Pagination.Navigation>
        <Pagination.Previous />
        <Pagination.Next />
      </Pagination.Navigation>
    </Pagination.Root>
  );
}

// Middle page (both buttons enabled)
export function MiddlePage() {
  return (
    <Pagination.Root page={5} totalItems={1000} pageSize={100}>
      <Pagination.Label />
      <Pagination.Range />
      <Pagination.Navigation>
        <Pagination.Previous />
        <Pagination.Next />
      </Pagination.Navigation>
    </Pagination.Root>
  );
}

// Empty state (no items)
export function EmptyState() {
  return (
    <Pagination.Root page={1} totalItems={0} pageSize={100}>
      <Pagination.Label />
      <Pagination.Range />
      <Pagination.Navigation>
        <Pagination.Previous />
        <Pagination.Next />
      </Pagination.Navigation>
    </Pagination.Root>
  );
}

// Controlled pagination for interaction tests
export function ControlledPagination() {
  const [page, setPage] = React.useState(5);
  const pageSize = 100;
  const totalItems = 1000;

  return (
    <div>
      <Pagination.Root
        page={page}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={setPage}
      >
        <Pagination.Label />
        <Pagination.Range />
        <Pagination.Navigation>
          <Pagination.Previous />
          <Pagination.Next />
        </Pagination.Navigation>
      </Pagination.Root>
      <p data-testid="current-page">Current page: {page}</p>
    </div>
  );
}

export function AnchorRender() {
  const page = 3;

  return (
    <Pagination.Root page={page} totalItems={250} pageSize={25}>
      <Pagination.Range />
      <Pagination.Navigation>
        <Pagination.Previous
          data-testid="prev"
          render={
            <a
              href={`?page=${page - 1}`}
              onClick={(event) => {
                event.preventDefault();
              }}
            />
          }
        />
        <Pagination.Next
          data-testid="next"
          render={
            <a
              href={`?page=${page + 1}`}
              onClick={(event) => {
                event.preventDefault();
              }}
            />
          }
        />
      </Pagination.Navigation>
    </Pagination.Root>
  );
}

export function AnchorRenderFirstPage() {
  const page = 1;

  return (
    <Pagination.Root page={page} totalItems={250} pageSize={25}>
      <Pagination.Navigation>
        <Pagination.Previous
          data-testid="prev"
          render={
            <a
              href={`?page=${page - 1}`}
              onClick={(event) => {
                event.preventDefault();
              }}
            />
          }
        />
        <Pagination.Next data-testid="next" />
      </Pagination.Navigation>
    </Pagination.Root>
  );
}

export function WithoutTotals() {
  const [page, setPage] = React.useState(1);

  return (
    <div>
      <Pagination.Root page={page} pageSize={25} onPageChange={setPage}>
        <Pagination.Range>
          {({ totalItems }) =>
            totalItems === undefined ? `Page ${page}` : `${totalItems} total`
          }
        </Pagination.Range>
        <Pagination.Navigation>
          <Pagination.Previous />
          <Pagination.Next />
        </Pagination.Navigation>
      </Pagination.Root>
      <p data-testid="current-page">Current page: {page}</p>
    </div>
  );
}

function CurrentPageBadge() {
  const { page } = usePaginationContext();
  return <span data-testid="ctx-page">{page}</span>;
}

export function ContextConsumer() {
  return (
    <Pagination.Root page={7} totalItems={500} pageSize={25}>
      <CurrentPageBadge />
    </Pagination.Root>
  );
}

// Custom range format
export function CustomRangeFormat() {
  return (
    <Pagination.Root page={1} totalItems={2500} pageSize={100}>
      <Pagination.Range>
        {({ startItem, endItem, totalItems }) => (
          <>
            Showing{" "}
            <strong>
              {startItem}-{endItem}
            </strong>{" "}
            of <strong>{totalItems}</strong> results
          </>
        )}
      </Pagination.Range>
      <Pagination.Navigation>
        <Pagination.Previous />
        <Pagination.Next />
      </Pagination.Navigation>
    </Pagination.Root>
  );
}
