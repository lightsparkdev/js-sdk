"use client";

import * as React from "react";
import { LoadMore } from "./LoadMore";
import { Button } from "../Button";
import { useLoadMore } from "./useLoadMore";
import { AnalyticsProvider } from "../Analytics";
import type { AnalyticsHandler, InteractionInfo } from "../Analytics";

interface CounterRefs {
  loadCount: number;
}

function ManualHarness({
  hasMore = true,
  loading = false,
}: {
  hasMore?: boolean;
  loading?: boolean;
}) {
  const [count, setCount] = React.useState(0);
  return (
    <LoadMore.Root
      hasMore={hasMore}
      loading={loading}
      onLoadMore={() => setCount((c) => c + 1)}
    >
      <LoadMore.Trigger />
      <p data-testid="load-count">Loads: {count}</p>
    </LoadMore.Root>
  );
}

export function TriggerEnabled() {
  return <ManualHarness />;
}

export function TriggerNoMore() {
  return <ManualHarness hasMore={false} />;
}

export function TriggerLoading() {
  return <ManualHarness loading={true} />;
}

export function TriggerCustomRender() {
  const [count, setCount] = React.useState(0);
  return (
    <LoadMore.Root
      hasMore={true}
      loading={false}
      onLoadMore={() => setCount((c) => c + 1)}
    >
      <LoadMore.Trigger render={<Button variant="ghost">Show more</Button>} />
      <p data-testid="load-count">Loads: {count}</p>
    </LoadMore.Root>
  );
}

function SentinelHarness({
  initialHasMore = true,
  hold = false,
}: {
  initialHasMore?: boolean;
  hold?: boolean;
}) {
  const [count, setCount] = React.useState(0);
  const [hasMore, setHasMore] = React.useState(initialHasMore);
  const [loading, setLoading] = React.useState(false);

  const onLoadMore = React.useCallback(() => {
    setCount((c) => c + 1);
    if (hold) {
      setLoading(true);
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setHasMore(false);
    }, 50);
  }, [hold]);

  return (
    <div>
      <div style={{ height: "200vh" }} data-testid="spacer" />
      <LoadMore.Root
        hasMore={hasMore}
        loading={loading}
        onLoadMore={onLoadMore}
      >
        <LoadMore.Sentinel rootMargin="0px" />
        <p data-testid="load-count">Loads: {count}</p>
      </LoadMore.Root>
    </div>
  );
}

export function SentinelTriggersOnScroll() {
  return <SentinelHarness />;
}

export function SentinelDoesNotRefireWhileLoading() {
  return <SentinelHarness hold={true} />;
}

export function SentinelDisabled() {
  return (
    <LoadMore.Root hasMore={true} loading={false} onLoadMore={() => undefined}>
      <LoadMore.Sentinel disabled data-testid="sentinel" />
    </LoadMore.Root>
  );
}

export function StatusAnnouncements({
  hasMore = true,
  loading = false,
}: {
  hasMore?: boolean;
  loading?: boolean;
}) {
  return (
    <LoadMore.Root
      hasMore={hasMore}
      loading={loading}
      onLoadMore={() => undefined}
    >
      <LoadMore.Status data-testid="status">
        {({ loading, hasMore }) =>
          loading
            ? "Loading more results"
            : !hasMore
            ? "End of results"
            : "More available"
        }
      </LoadMore.Status>
    </LoadMore.Root>
  );
}

export function StatusLoading() {
  return <StatusAnnouncements loading={true} />;
}

export function StatusEnd() {
  return <StatusAnnouncements hasMore={false} />;
}

export function ContextOutsideRoot() {
  return (
    <ErrorBoundary>
      <LoadMore.Trigger />
    </ErrorBoundary>
  );
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return <div data-testid="error">{this.state.error.message}</div>;
    }
    return this.props.children;
  }
}

export function AnalyticsTrigger() {
  const [events, setEvents] = React.useState<InteractionInfo[]>([]);
  const handler = React.useMemo<AnalyticsHandler>(
    () => ({
      onInteraction: (info) => setEvents((prev) => [...prev, info]),
    }),
    [],
  );

  return (
    <AnalyticsProvider value={handler}>
      <LoadMore.Root
        hasMore
        loading={false}
        onLoadMore={() => undefined}
        analyticsName="results"
      >
        <LoadMore.Trigger />
      </LoadMore.Root>
      <pre data-testid="analytics-log">{JSON.stringify(events)}</pre>
    </AnalyticsProvider>
  );
}

export function HookIntegration() {
  const fetchPage = React.useCallback(async (cursor: string | undefined) => {
    const offset = cursor ? Number(cursor) : 0;
    const data = Array.from({ length: 5 }, (_, i) => ({
      id: `${offset + i}`,
    }));
    const next = offset + 5;
    return {
      data,
      nextCursor: next < 15 ? String(next) : undefined,
      hasMore: next < 15,
    };
  }, []);

  const { items, hasMore, loading, loadingMore, loadMore } = useLoadMore<{
    id: string;
  }>({
    fetchPage,
  });

  return (
    <div>
      <ul data-testid="items">
        {items.map((item) => (
          <li key={item.id}>{item.id}</li>
        ))}
      </ul>
      <LoadMore.Root
        hasMore={hasMore}
        loading={loading || loadingMore}
        onLoadMore={loadMore}
      >
        <LoadMore.Trigger />
      </LoadMore.Root>
    </div>
  );
}
