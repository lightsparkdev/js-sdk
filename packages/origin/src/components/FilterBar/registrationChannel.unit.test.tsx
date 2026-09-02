import { act, cleanup, renderHook } from "@testing-library/react";
import { StrictMode, useEffect } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createRegistrationChannel } from "./registrationChannel";

interface TestAction {
  id: string;
}

const EMPTY: readonly TestAction[] = [];
const ACTIONS_A: readonly TestAction[] = [{ id: "date" }];
const ACTIONS_A_UPDATED: readonly TestAction[] = [{ id: "date-updated" }];
const ACTIONS_B: readonly TestAction[] = [{ id: "status" }];
const ACTIONS_B_UPDATED: readonly TestAction[] = [{ id: "status-updated" }];

function createStore(
  initialSnapshot: readonly TestAction[] = EMPTY,
  serverSnapshot: readonly TestAction[] = EMPTY,
) {
  let snapshot = initialSnapshot;
  const listeners = new Set<() => void>();
  const getSnapshot = vi.fn(() => snapshot);
  const getServerSnapshot = vi.fn(() => serverSnapshot);
  const subscribe = vi.fn((onStoreChange: () => void) => {
    listeners.add(onStoreChange);
    return () => listeners.delete(onStoreChange);
  });
  const publish = vi.fn((registrations: readonly TestAction[]) => {
    snapshot = registrations;
    listeners.forEach((listener) => listener());
  });
  const store = {
    getSnapshot,
    getServerSnapshot,
    subscribe,
    publish,
  };

  return {
    getSnapshot,
    getServerSnapshot,
    publish,
    store,
    subscribe,
  };
}

afterEach(cleanup);

describe("createRegistrationChannel", () => {
  it("preserves rank across updates and restores the latest survivor", () => {
    const { publish, store } = createStore();
    const channel = createRegistrationChannel(store);
    const leaseA = channel.registry.acquire(ACTIONS_A);
    expect(publish).toHaveBeenCalledTimes(1);
    expect(publish).toHaveBeenLastCalledWith(ACTIONS_A);

    const leaseB = channel.registry.acquire(ACTIONS_B);
    expect(publish).toHaveBeenCalledTimes(2);
    expect(publish).toHaveBeenLastCalledWith(ACTIONS_B);

    leaseA.update(ACTIONS_A_UPDATED);
    expect(publish).toHaveBeenCalledTimes(2);
    expect(publish).toHaveBeenLastCalledWith(ACTIONS_B);

    leaseB.update(ACTIONS_B_UPDATED);
    expect(publish).toHaveBeenCalledTimes(3);
    expect(publish).toHaveBeenLastCalledWith(ACTIONS_B_UPDATED);

    leaseB.release();
    expect(publish).toHaveBeenCalledTimes(4);
    expect(publish).toHaveBeenLastCalledWith(ACTIONS_A_UPDATED);

    leaseA.release();
    expect(publish).toHaveBeenCalledTimes(5);
    expect(publish).toHaveBeenLastCalledWith(EMPTY);
  });

  it("releasing an inactive lease leaves the active lease published", () => {
    const { publish, store } = createStore();
    const channel = createRegistrationChannel(store);
    const leaseA = channel.registry.acquire(ACTIONS_A);
    const leaseB = channel.registry.acquire(ACTIONS_B);

    leaseA.release();

    expect(publish).toHaveBeenCalledTimes(2);
    expect(publish).toHaveBeenLastCalledWith(ACTIONS_B);

    leaseB.release();
    expect(publish).toHaveBeenLastCalledWith(EMPTY);
  });

  it("ignores update after release and makes release idempotent", () => {
    const { publish, store } = createStore();
    const channel = createRegistrationChannel(store);
    const leaseA = channel.registry.acquire(ACTIONS_A);

    leaseA.release();
    leaseA.release();
    const publishCount = publish.mock.calls.length;
    leaseA.update(ACTIONS_A_UPDATED);

    expect(publish).toHaveBeenCalledTimes(publishCount);
    expect(publish).toHaveBeenLastCalledWith(EMPTY);
  });

  it("keeps stale StrictMode cleanup ownership-safe", () => {
    const { publish, store } = createStore();
    const channel = createRegistrationChannel(store);
    const effectCleanups: Array<() => void> = [];
    const registry = channel.registry;
    const reader = renderHook(() => channel.useRegistrations());
    const writer = renderHook(
      ({ registrations }) => {
        useEffect(() => {
          const lease = registry.acquire(registrations);
          const release = () => lease.release();
          effectCleanups.push(release);
          return release;
        }, [registrations, registry]);
      },
      {
        initialProps: { registrations: ACTIONS_A },
        wrapper: StrictMode,
      },
    );

    expect(effectCleanups).toHaveLength(2);
    expect(reader.result.current).toBe(ACTIONS_A);
    expect(publish).toHaveBeenLastCalledWith(ACTIONS_A);

    const staleCleanup = effectCleanups[0];
    expect(staleCleanup).toBeDefined();
    const publishCount = publish.mock.calls.length;
    act(() => {
      staleCleanup?.();
    });

    expect(publish).toHaveBeenCalledTimes(publishCount);
    expect(reader.result.current).toBe(ACTIONS_A);
    expect(publish).toHaveBeenLastCalledWith(ACTIONS_A);

    writer.unmount();
    expect(reader.result.current).toEqual(EMPTY);
    expect(publish).toHaveBeenLastCalledWith(EMPTY);
  });

  it("reads stable external snapshots without subscribing writers", () => {
    const { store, subscribe } = createStore();
    const channel = createRegistrationChannel(store);
    const lease = channel.registry.acquire(ACTIONS_A);
    lease.update(ACTIONS_A_UPDATED);
    lease.release();

    expect(subscribe).not.toHaveBeenCalled();

    const { rerender, result } = renderHook(() => channel.useRegistrations());
    const emptySnapshot = result.current;
    expect(emptySnapshot).toEqual(EMPTY);
    rerender();
    expect(result.current).toBe(emptySnapshot);
    expect(subscribe).toHaveBeenCalled();

    let leaseB: ReturnType<typeof channel.registry.acquire> | undefined;
    act(() => {
      leaseB = channel.registry.acquire(ACTIONS_B);
    });
    expect(result.current).toBe(ACTIONS_B);

    act(() => {
      leaseB?.release();
    });
    expect(result.current).toBe(emptySnapshot);
  });

  it("uses the stable server snapshot without reading client state", () => {
    const SERVER_ACTIONS: readonly TestAction[] = [{ id: "server" }];
    const { getServerSnapshot, getSnapshot, store, subscribe } = createStore(
      ACTIONS_A,
      SERVER_ACTIONS,
    );
    const channel = createRegistrationChannel(store);
    let renderedRegistrations: readonly TestAction[] | undefined;

    function Reader() {
      renderedRegistrations = channel.useRegistrations();
      return null;
    }

    renderToString(<Reader />);

    expect(renderedRegistrations).toBe(SERVER_ACTIONS);
    expect(getServerSnapshot).toHaveBeenCalled();
    expect(getSnapshot).not.toHaveBeenCalled();
    expect(subscribe).not.toHaveBeenCalled();
  });
});
