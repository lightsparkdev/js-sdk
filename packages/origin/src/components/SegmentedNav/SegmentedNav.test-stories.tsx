"use client";

import * as React from "react";
import { SegmentedNav } from "./";

type RouteValue = "/route-a" | "/route-b" | "/route-c";

interface RouterContextValue {
  route: RouteValue;
  navigate: (nextRoute: RouteValue) => void;
}

const RouterContext = React.createContext<RouterContextValue | null>(null);

function useRouterContext() {
  const context = React.useContext(RouterContext);

  if (!context) {
    throw new Error(
      "Route test components must be used within the route harness.",
    );
  }

  return context;
}

const RouteLink = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<"a"> & { href: RouteValue }
>(function RouteLink({ href, onClick, children, ...props }, ref) {
  const { navigate } = useRouterContext();

  return (
    <a
      ref={ref}
      href={href}
      onClick={(event) => {
        event.preventDefault();
        onClick?.(event);
        navigate(href);
      }}
      {...props}
    >
      {children}
    </a>
  );
});

function RoutePanel() {
  const { route } = useRouterContext();

  return (
    <div>
      <div data-testid="current-route">{route}</div>
      <div>
        {route === "/route-a"
          ? "Route A"
          : route === "/route-b"
          ? "Route B"
          : "Route C"}
      </div>
    </div>
  );
}

function RouteHarness({
  children,
  initialRoute = "/route-a",
}: {
  children: React.ReactNode;
  initialRoute?: RouteValue;
}) {
  const [route, setRoute] = React.useState<RouteValue>(initialRoute);
  const navigate = React.useCallback((nextRoute: RouteValue) => {
    setRoute(nextRoute);
  }, []);

  const value = React.useMemo(() => ({ route, navigate }), [route, navigate]);

  return (
    <RouterContext.Provider value={value}>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {children}
        <RoutePanel />
      </div>
    </RouterContext.Provider>
  );
}

export function DefaultSegmentedNav() {
  return (
    <SegmentedNav aria-label="Payout sections">
      <SegmentedNav.Link render={<a href="/payouts" />}>
        Overview
      </SegmentedNav.Link>
      <SegmentedNav.Link active render={<a href="/payouts/activity" />}>
        Activity
      </SegmentedNav.Link>
      <SegmentedNav.Link render={<a href="/payouts/recipients" />}>
        Recipients
      </SegmentedNav.Link>
    </SegmentedNav>
  );
}

export function PlainAnchorSegmentedNav() {
  return (
    <SegmentedNav aria-label="Balance sections">
      <SegmentedNav.Link render={<a href="/balances" />}>
        Balances
      </SegmentedNav.Link>
      <SegmentedNav.Link active render={<a href="/balances/activity" />}>
        Activity
      </SegmentedNav.Link>
    </SegmentedNav>
  );
}

export function GroupedSegmentedNav() {
  return (
    <SegmentedNav aria-label="Payout sections">
      <SegmentedNav.Group>
        <SegmentedNav.Link render={<a href="/payouts" />}>
          Overview
        </SegmentedNav.Link>
        <SegmentedNav.Link active render={<a href="/payouts/activity" />}>
          Platform payouts
        </SegmentedNav.Link>
        <SegmentedNav.Link render={<a href="/payouts/recipients" />}>
          Recipients
        </SegmentedNav.Link>
      </SegmentedNav.Group>
      <SegmentedNav.Group data-testid="grouped-secondary-group">
        <SegmentedNav.Link render={<a href="/payouts/customers" />}>
          Customer payouts
        </SegmentedNav.Link>
      </SegmentedNav.Group>
    </SegmentedNav>
  );
}

export function LinkPropForwardingSegmentedNav() {
  return (
    <SegmentedNav aria-label="Forwarded props">
      <SegmentedNav.Link
        active
        render={
          <a
            href="/forwarded"
            data-testid="forwarded-link"
            data-custom="value"
            className="custom-link"
            style={{ color: "rgb(255, 0, 0)" }}
          />
        }
      >
        Forwarded
      </SegmentedNav.Link>
    </SegmentedNav>
  );
}

export function ClickableSegmentedNav() {
  const [clicked, setClicked] = React.useState(false);

  return (
    <div>
      <SegmentedNav aria-label="Clickable sections">
        <SegmentedNav.Link
          render={
            <a
              href="/interactive"
              onClick={(event) => {
                event.preventDefault();
                setClicked(true);
              }}
            />
          }
        >
          Interactive
        </SegmentedNav.Link>
      </SegmentedNav>
      <span>{clicked ? "Clicked" : "Not clicked"}</span>
    </div>
  );
}

export function PlainLinksRouteHarness() {
  return (
    <RouteHarness>
      <SegmentedNav aria-label="Route harness plain links">
        <RouteLink href="/route-a">Route A</RouteLink>
        <RouteLink href="/route-b">Route B</RouteLink>
        <RouteLink href="/route-c">Route C</RouteLink>
      </SegmentedNav>
    </RouteHarness>
  );
}

export function RenderLinksRouteHarness() {
  return (
    <RouteHarness>
      <SegmentedNav aria-label="Route harness render links">
        <SegmentedNav.Link render={<RouteLink href="/route-a" />}>
          Route A
        </SegmentedNav.Link>
        <SegmentedNav.Link render={<RouteLink href="/route-b" />}>
          Route B
        </SegmentedNav.Link>
        <SegmentedNav.Link render={<RouteLink href="/route-c" />}>
          Route C
        </SegmentedNav.Link>
      </SegmentedNav>
    </RouteHarness>
  );
}

export function GroupedLinksRouteHarness() {
  return (
    <RouteHarness>
      <SegmentedNav aria-label="Route harness grouped links">
        <SegmentedNav.Group>
          <SegmentedNav.Link render={<RouteLink href="/route-a" />}>
            Route A
          </SegmentedNav.Link>
          <SegmentedNav.Link render={<RouteLink href="/route-b" />}>
            Route B
          </SegmentedNav.Link>
        </SegmentedNav.Group>
        <SegmentedNav.Group>
          <SegmentedNav.Link render={<RouteLink href="/route-c" />}>
            Route C
          </SegmentedNav.Link>
        </SegmentedNav.Group>
      </SegmentedNav>
    </RouteHarness>
  );
}

export function ControlRouteHarness() {
  return (
    <RouteHarness>
      <div style={{ display: "inline-flex", gap: "8px" }}>
        <RouteLink href="/route-a">Route A</RouteLink>
        <RouteLink href="/route-b">Route B</RouteLink>
        <RouteLink href="/route-c">Route C</RouteLink>
      </div>
    </RouteHarness>
  );
}
