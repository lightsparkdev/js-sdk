/**
 * LoadMore Unit Tests (Vitest + @testing-library/react)
 *
 * For real browser testing (IntersectionObserver, scroll, accessibility),
 * see LoadMore.test.tsx (Playwright CT).
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render } from "@testing-library/react";
import * as React from "react";
import { LoadMore } from "./LoadMore";

type ObserverCallback = (
  entries: IntersectionObserverEntry[],
  observer: IntersectionObserver,
) => void;

interface MockObserver {
  observe: ReturnType<typeof vi.fn>;
  unobserve: ReturnType<typeof vi.fn>;
  disconnect: ReturnType<typeof vi.fn>;
  takeRecords: ReturnType<typeof vi.fn>;
  callback: ObserverCallback;
}

const observers: MockObserver[] = [];

beforeEach(() => {
  observers.length = 0;
  class MockIntersectionObserver implements MockObserver {
    callback: ObserverCallback;
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
    takeRecords = vi.fn(() => []);

    constructor(callback: ObserverCallback) {
      this.callback = callback;
      observers.push(this);
    }
  }
  vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function fireIntersect(observer: MockObserver) {
  const target = observer.observe.mock.calls[0]?.[0] as Element;
  observer.callback(
    [
      {
        isIntersecting: true,
        target,
        intersectionRatio: 1,
        boundingClientRect: target.getBoundingClientRect(),
        intersectionRect: target.getBoundingClientRect(),
        rootBounds: null,
        time: 0,
      } as IntersectionObserverEntry,
    ],
    observer as unknown as IntersectionObserver,
  );
}

describe("LoadMore.Sentinel initial mount", () => {
  it("fires onLoadMore exactly once when the sentinel mounts already in view", () => {
    const onLoadMore = vi.fn();
    render(
      <LoadMore.Root hasMore loading={false} onLoadMore={onLoadMore}>
        <LoadMore.Sentinel />
      </LoadMore.Root>,
    );

    expect(observers).toHaveLength(1);
    fireIntersect(observers[0]);

    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });
});
