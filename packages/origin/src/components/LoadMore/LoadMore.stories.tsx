import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { LoadMore } from "./LoadMore";
import { useLoadMore } from "./useLoadMore";
import { Button } from "../Button";

interface Item {
  id: string;
  label: string;
}

function generatePage(offset: number, size: number): Item[] {
  return Array.from({ length: size }, (_, i) => ({
    id: `${offset + i}`,
    label: `Item ${offset + i + 1}`,
  }));
}

function ItemList({ items }: { items: Item[] }) {
  return (
    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
      {items.map((item) => (
        <li
          key={item.id}
          style={{
            padding: "12px 16px",
            borderBottom: "1px solid var(--border-primary)",
          }}
        >
          {item.label}
        </li>
      ))}
    </ul>
  );
}

const meta: Meta<typeof LoadMore.Root> = {
  title: "Components/LoadMore",
  component: LoadMore.Root,
  parameters: { layout: "centered" },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const ManualTrigger: Story = {
  render: () => {
    const [items, setItems] = React.useState(() => generatePage(0, 10));
    const [loading, setLoading] = React.useState(false);
    const [hasMore, setHasMore] = React.useState(true);

    const onLoadMore = () => {
      setLoading(true);
      setTimeout(() => {
        setItems((prev) => {
          const next = [...prev, ...generatePage(prev.length, 10)];
          if (next.length >= 30) setHasMore(false);
          return next;
        });
        setLoading(false);
      }, 600);
    };

    return (
      <div style={{ width: 320 }}>
        <ItemList items={items} />
        <LoadMore.Root
          hasMore={hasMore}
          loading={loading}
          onLoadMore={onLoadMore}
        >
          <LoadMore.Trigger />
        </LoadMore.Root>
      </div>
    );
  },
};

export const AutoSentinel: Story = {
  render: () => {
    const { items, hasMore, loading, loadingMore, loadMore } =
      useLoadMore<Item>({
        fetchPage: async (cursor) => {
          const offset = cursor ? Number(cursor) : 0;
          await new Promise((r) => setTimeout(r, 500));
          const data = generatePage(offset, 10);
          const next = offset + 10;
          return {
            data,
            nextCursor: next < 50 ? String(next) : undefined,
            hasMore: next < 50,
          };
        },
      });

    return (
      <div style={{ width: 320, height: 360, overflow: "auto" }}>
        <ItemList items={items} />
        <LoadMore.Root
          hasMore={hasMore}
          loading={loading || loadingMore}
          onLoadMore={loadMore}
        >
          <LoadMore.Sentinel />
          <LoadMore.Status>
            {({ loading, hasMore }) =>
              loading
                ? "Loading more results"
                : !hasMore
                ? "End of results"
                : ""
            }
          </LoadMore.Status>
        </LoadMore.Root>
      </div>
    );
  },
};

export const SentinelWithFallbackTrigger: Story = {
  render: () => {
    const { items, hasMore, loading, loadingMore, loadMore } =
      useLoadMore<Item>({
        fetchPage: async (cursor) => {
          const offset = cursor ? Number(cursor) : 0;
          await new Promise((r) => setTimeout(r, 400));
          const data = generatePage(offset, 5);
          const next = offset + 5;
          return {
            data,
            nextCursor: next < 25 ? String(next) : undefined,
            hasMore: next < 25,
          };
        },
      });

    return (
      <div style={{ width: 320 }}>
        <ItemList items={items} />
        <LoadMore.Root
          hasMore={hasMore}
          loading={loading || loadingMore}
          onLoadMore={loadMore}
        >
          <LoadMore.Sentinel />
          <div
            style={{ display: "flex", justifyContent: "center", padding: 16 }}
          >
            <LoadMore.Trigger />
          </div>
          <LoadMore.Status>
            {({ loading, hasMore }) =>
              loading
                ? "Loading more results"
                : !hasMore
                ? "End of results"
                : ""
            }
          </LoadMore.Status>
        </LoadMore.Root>
      </div>
    );
  },
};

export const EndOfResults: Story = {
  render: () => (
    <div style={{ width: 320 }}>
      <ItemList items={generatePage(0, 5)} />
      <LoadMore.Root
        hasMore={false}
        loading={false}
        onLoadMore={() => undefined}
      >
        <LoadMore.Trigger />
        <LoadMore.Status>
          {({ hasMore }) => (!hasMore ? "End of results" : "")}
        </LoadMore.Status>
      </LoadMore.Root>
    </div>
  ),
};

export const LoadingState: Story = {
  render: () => (
    <div style={{ width: 320 }}>
      <ItemList items={generatePage(0, 5)} />
      <LoadMore.Root hasMore loading onLoadMore={() => undefined}>
        <LoadMore.Trigger />
      </LoadMore.Root>
    </div>
  ),
};

export const CustomTriggerRender: Story = {
  render: () => (
    <LoadMore.Root hasMore loading={false} onLoadMore={() => undefined}>
      <LoadMore.Trigger render={<Button variant="ghost">Show more</Button>} />
    </LoadMore.Root>
  ),
};

export const WithFilterReset: Story = {
  render: () => {
    const [filter, setFilter] = React.useState("all");
    const { items, hasMore, loading, loadingMore, loadMore } =
      useLoadMore<Item>({
        fetchPage: async (cursor) => {
          const offset = cursor ? Number(cursor) : 0;
          await new Promise((r) => setTimeout(r, 300));
          const data = generatePage(offset, 5).map((item) => ({
            ...item,
            label: `${filter}: ${item.label}`,
          }));
          const next = offset + 5;
          return {
            data,
            nextCursor: next < 20 ? String(next) : undefined,
            hasMore: next < 20,
          };
        },
        resetOn: [filter],
      });

    return (
      <div style={{ width: 360 }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          {["all", "starred", "archived"].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              style={{ fontWeight: filter === value ? 700 : 400 }}
            >
              {value}
            </button>
          ))}
        </div>
        <ItemList items={items} />
        <LoadMore.Root
          hasMore={hasMore}
          loading={loading || loadingMore}
          onLoadMore={loadMore}
        >
          <LoadMore.Trigger />
        </LoadMore.Root>
      </div>
    );
  },
};
