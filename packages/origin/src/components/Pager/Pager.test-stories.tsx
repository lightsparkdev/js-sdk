"use client";

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
  { prev: "p2", next: null },
];

export function BasicPager() {
  return (
    <Pager.Root hasPrevious hasNext>
      <Pager.Status>Showing 25 results</Pager.Status>
      <Pager.Navigation>
        <Pager.Previous />
        <Pager.Next />
      </Pager.Navigation>
    </Pager.Root>
  );
}

export function NoPreviousCursor() {
  return (
    <Pager.Root hasPrevious={false} hasNext>
      <Pager.Status>Showing 25 results</Pager.Status>
      <Pager.Navigation>
        <Pager.Previous />
        <Pager.Next />
      </Pager.Navigation>
    </Pager.Root>
  );
}

export function NoNextCursor() {
  return (
    <Pager.Root hasPrevious hasNext={false}>
      <Pager.Status>Showing 25 results</Pager.Status>
      <Pager.Navigation>
        <Pager.Previous />
        <Pager.Next />
      </Pager.Navigation>
    </Pager.Root>
  );
}

export function BothEdges() {
  return (
    <Pager.Root hasPrevious={false} hasNext={false}>
      <Pager.Status>No results</Pager.Status>
      <Pager.Navigation>
        <Pager.Previous />
        <Pager.Next />
      </Pager.Navigation>
    </Pager.Root>
  );
}

export function ControlledPager() {
  const [index, setIndex] = React.useState(1);
  const cursor = PAGES[index];

  return (
    <div>
      <Pager.Root
        hasPrevious={cursor.prev !== null}
        hasNext={cursor.next !== null}
        onPrevious={() => setIndex((i) => Math.max(0, i - 1))}
        onNext={() => setIndex((i) => Math.min(PAGES.length - 1, i + 1))}
      >
        <Pager.Status>Page {index + 1}</Pager.Status>
        <Pager.Navigation>
          <Pager.Previous />
          <Pager.Next />
        </Pager.Navigation>
      </Pager.Root>
      <p data-testid="cursor">
        prev:{cursor.prev ?? "null"} next:{cursor.next ?? "null"}
      </p>
    </div>
  );
}

export function PagerWithLinkRender() {
  return (
    <Pager.Root hasPrevious hasNext>
      <Pager.Navigation>
        <Pager.Previous render={<a href="?before=p1" />} />
        <Pager.Next render={<a href="?after=p2" />} />
      </Pager.Navigation>
    </Pager.Root>
  );
}

export function PagerWithCustomLabel() {
  return (
    <Pager.Root hasPrevious hasNext>
      <Pager.Navigation>
        <Pager.Previous aria-label="Older results">Older</Pager.Previous>
        <Pager.Next aria-label="Newer results">Newer</Pager.Next>
      </Pager.Navigation>
    </Pager.Root>
  );
}

export function PagerWithPreventDefault() {
  const [count, setCount] = React.useState(0);

  return (
    <div>
      <Pager.Root
        hasPrevious
        hasNext
        onPrevious={() => setCount((c) => c + 1)}
        onNext={() => setCount((c) => c + 1)}
      >
        <Pager.Navigation>
          <Pager.Previous
            onClick={(event) => {
              event.preventDefault();
            }}
          />
          <Pager.Next />
        </Pager.Navigation>
      </Pager.Root>
      <p data-testid="count">count:{count}</p>
    </div>
  );
}

export function ExplicitDisabledOverride() {
  return (
    <Pager.Root hasPrevious={false} hasNext>
      <Pager.Navigation>
        <Pager.Previous disabled={false} />
        <Pager.Next />
      </Pager.Navigation>
    </Pager.Root>
  );
}

export function PagerSideBySidePagination() {
  return (
    <div style={{ display: "flex", gap: 32 }}>
      <Pager.Root hasPrevious hasNext data-testid="pager">
        <Pager.Navigation>
          <Pager.Previous />
          <Pager.Next />
        </Pager.Navigation>
      </Pager.Root>
      <Pagination.Root
        page={5}
        totalItems={1000}
        pageSize={100}
        data-testid="pagination"
      >
        <Pagination.Navigation>
          <Pagination.Previous />
          <Pagination.Next />
        </Pagination.Navigation>
      </Pagination.Root>
    </div>
  );
}

export function PagerWithoutHandlers() {
  return (
    <Pager.Root hasPrevious hasNext>
      <Pager.Navigation>
        <Pager.Previous />
        <Pager.Next />
      </Pager.Navigation>
    </Pager.Root>
  );
}
