import * as React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Item } from "./Item";

const RoutedLink = React.forwardRef<
  HTMLAnchorElement,
  {
    to?: string;
    externalLink?: string;
    disabled?: boolean;
    params?: Record<string, string>;
    newTab?: boolean;
    as?: string;
    legacyBehavior?: boolean;
    locale?: string | false;
    onNavigate?: () => void;
    passHref?: boolean;
    scroll?: boolean;
    shallow?: boolean;
  } & Omit<React.ComponentPropsWithoutRef<"a">, "href">
>(function RoutedLink(
  { to, externalLink, disabled, params, newTab, ...props },
  ref,
) {
  const href = Object.entries(params ?? {}).reduce(
    (path, [key, value]) => path.replace(`:${key}`, value),
    to ?? externalLink ?? "",
  );
  return (
    <a
      ref={ref}
      href={disabled || href === "" ? undefined : href}
      target={newTab ? "_blank" : undefined}
      {...props}
    />
  );
});

const HrefLink = React.forwardRef<
  HTMLAnchorElement,
  { href: string } & Omit<React.ComponentPropsWithoutRef<"a">, "href">
>(function HrefLink({ href, ...props }, ref) {
  return <a ref={ref} href={href} {...props} />;
});

describe("Item disclosure", () => {
  afterEach(cleanup);

  it("renders no trailing content by default", () => {
    const { container } = render(<Item title="Account settings" />);

    expect(container.querySelector("svg")).toBeNull();
  });

  it("renders the canonical 20px chevron when opted in", () => {
    const { container } = render(<Item title="Account settings" disclosure />);
    const icon = container.querySelector("svg");

    expect(icon).not.toBeNull();
    expect(icon).toHaveAttribute("width", "20px");
    expect(icon).toHaveAttribute("height", "20px");
  });

  it("preserves arbitrary trailing content", () => {
    render(
      <Item title="Keyboard shortcut" trailing={<span>Command K</span>} />,
    );

    expect(screen.getByText("Command K")).toBeInTheDocument();
  });

  it("prefers intentional empty trailing content over disclosure", () => {
    const { container, rerender } = render(
      <Item title="Account settings" disclosure trailing={null} />,
    );

    expect(container.querySelector("svg")).toBeNull();

    rerender(<Item title="Account settings" disclosure trailing={false} />);

    expect(container.querySelector("svg")).toBeNull();
  });

  it("prefers custom trailing content over disclosure", () => {
    const { container } = render(
      <Item
        title="Account settings"
        disclosure
        trailing={<span>Custom action</span>}
      />,
    );

    expect(screen.getByText("Custom action")).toBeInTheDocument();
    expect(container.querySelector("svg")).toBeNull();
  });
});

describe("Item render contract", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("keeps a static item non-interactive", () => {
    render(<Item title="Static item" />);

    const item = screen.getByText("Static item").parentElement?.parentElement;
    expect(item).not.toHaveAttribute("role");
    expect(item).not.toHaveAttribute("tabindex");
  });

  it("forwards the ref and composes render props", () => {
    const ref = React.createRef<HTMLDivElement>();
    let itemClicks = 0;
    let renderClicks = 0;

    render(
      <Item
        ref={ref}
        title="Choose option"
        className="item-class"
        style={{ marginTop: 4 }}
        render={
          <button
            type="button"
            className="render-class"
            style={{ marginBottom: 8 }}
            onClick={() => {
              renderClicks += 1;
            }}
          />
        }
        onClick={() => {
          itemClicks += 1;
        }}
      />,
    );

    const button = screen.getByRole("button", { name: "Choose option" });
    fireEvent.click(button);

    expect(ref.current).toBe(button);
    expect(button).toHaveClass("item-class", "render-class");
    expect(button).toHaveStyle({ marginTop: "4px", marginBottom: "8px" });
    expect(itemClicks).toBe(1);
    expect(renderClicks).toBe(1);
  });

  it("keeps generated content when the render element has children", () => {
    render(
      <Item
        title="Choose option"
        render={<button type="button">Custom child</button>}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Choose option" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Custom child")).not.toBeInTheDocument();
  });

  it("disables a native button render element", () => {
    render(
      <Item
        title="Disabled option"
        disabled
        render={<button type="button" />}
      />,
    );

    const button = screen.getByRole("button", { name: "Disabled option" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-disabled", "true");
    expect(button).toHaveAttribute("tabindex", "-1");
  });

  it("removes navigation from a disabled native anchor", () => {
    render(
      <Item title="Disabled details" disabled render={<a href="#details" />} />,
    );

    const anchor = screen.getByText("Disabled details").closest("a");
    expect(anchor).not.toHaveAttribute("href");
    expect(anchor).toHaveAttribute("aria-disabled", "true");
    expect(anchor).toHaveAttribute("tabindex", "-1");
  });

  it("removes navigation from a disabled routed host", () => {
    let itemClicks = 0;
    let renderClicks = 0;

    render(
      <Item
        title="Disabled tokens"
        disabled
        render={
          <RoutedLink
            to="/settings/:section"
            params={{ section: "tokens" }}
            newTab
            as="/settings/tokens"
            legacyBehavior
            locale={false}
            onNavigate={() => undefined}
            passHref
            scroll={false}
            shallow
            onClick={() => {
              renderClicks += 1;
            }}
          />
        }
        onClick={() => {
          itemClicks += 1;
        }}
      />,
    );

    const anchor = screen.getByText("Disabled tokens").closest("a");
    expect(anchor).not.toHaveAttribute("href");
    expect(anchor).toHaveAttribute("aria-disabled", "true");
    expect(anchor).toHaveAttribute("tabindex", "-1");
    expect(anchor).not.toHaveAttribute("params");
    expect(anchor).not.toHaveAttribute("newtab");
    expect(anchor).not.toHaveAttribute("target");
    expect(anchor).not.toHaveAttribute("as");
    expect(anchor).not.toHaveAttribute("legacybehavior");
    expect(anchor).not.toHaveAttribute("locale");
    expect(anchor).not.toHaveAttribute("onnavigate");
    expect(anchor).not.toHaveAttribute("passhref");
    expect(anchor).not.toHaveAttribute("scroll");
    expect(anchor).not.toHaveAttribute("shallow");

    fireEvent.click(anchor!);
    fireEvent.keyDown(anchor!, { key: "Enter" });
    expect(itemClicks).toBe(0);
    expect(renderClicks).toBe(0);
  });

  it("preserves a routed render ref when disabled", () => {
    const renderRef = React.createRef<HTMLAnchorElement>();
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    render(
      <Item
        title="Disabled tokens"
        disabled
        render={<RoutedLink ref={renderRef} to="/settings/tokens" />}
      />,
    );

    expect(renderRef.current).toBe(
      screen.getByText("Disabled tokens").closest("a"),
    );
    expect(consoleError).not.toHaveBeenCalledWith(
      expect.stringContaining("Accessing element.ref"),
    );
  });

  it("removes navigation from a disabled external-link host", () => {
    render(
      <Item
        title="Disabled docs"
        disabled
        render={<RoutedLink externalLink="https://docs.example.com" />}
      />,
    );

    const anchor = screen.getByText("Disabled docs").closest("a");
    expect(anchor).not.toHaveAttribute("href");
    expect(anchor).toHaveAttribute("aria-disabled", "true");
    expect(anchor).toHaveAttribute("tabindex", "-1");
  });

  it("replaces a disabled custom href host with an inert anchor", () => {
    render(
      <Item
        title="Disabled Next link"
        disabled
        render={<HrefLink href="/settings" />}
      />,
    );

    const anchor = screen.getByText("Disabled Next link").closest("a");
    expect(anchor).not.toHaveAttribute("href");
    expect(anchor).toHaveAttribute("aria-disabled", "true");
    expect(anchor).toHaveAttribute("tabindex", "-1");
  });

  it("keeps the routed href while the item is enabled", () => {
    render(
      <Item
        title="Open tokens"
        render={<RoutedLink to="/settings/tokens" />}
        onClick={() => {}}
      />,
    );

    const anchor = screen.getByText("Open tokens").closest("a");
    expect(anchor).toHaveAttribute("href", "/settings/tokens");
  });

  it("wraps descriptions only when wrapDescription is set", () => {
    const description = "A long description that can wrap";
    const { rerender } = render(
      <Item
        title="Choose option"
        description={description}
        render={<button type="button" />}
      />,
    );
    const truncatedClass = screen.getByText(description).className;

    rerender(
      <Item
        title="Choose option"
        description={description}
        wrapDescription
        render={<button type="button" />}
      />,
    );
    const wrappedClass = screen.getByText(description).className;

    expect(wrappedClass).not.toBe(truncatedClass);
    expect(wrappedClass).toContain(truncatedClass);
  });

  it("adds keyboard semantics to a non-interactive native render element", () => {
    let activations = 0;

    render(
      <Item
        title="Choose option"
        render={<div />}
        onClick={() => {
          activations += 1;
        }}
      />,
    );

    const item = screen.getByRole("button", { name: "Choose option" });
    expect(item).toHaveAttribute("tabindex", "0");

    fireEvent.keyDown(item, { key: "Enter" });
    fireEvent.keyDown(item, { key: " " });

    expect(activations).toBe(2);
  });

  it("adds keyboard semantics to an anchor without an href", () => {
    let activations = 0;

    render(
      <Item
        title="Choose option"
        render={<a />}
        onClick={() => {
          activations += 1;
        }}
      />,
    );

    const item = screen.getByRole("button", { name: "Choose option" });
    expect(item).toHaveAttribute("tabindex", "0");

    fireEvent.keyDown(item, { key: "Enter" });
    fireEvent.keyDown(item, { key: " " });

    expect(activations).toBe(2);
  });

  it("composes non-native keyboard handling and honors cancellation", () => {
    let activations = 0;
    let keyDowns = 0;
    let cancelActivation = false;

    render(
      <Item
        title="Choose option"
        onClick={() => {
          activations += 1;
        }}
        onKeyDown={(event) => {
          keyDowns += 1;
          if (cancelActivation) {
            event.preventDefault();
          }
        }}
      />,
    );

    const item = screen.getByRole("button", { name: "Choose option" });
    fireEvent.keyDown(item, { key: "Enter" });
    cancelActivation = true;
    fireEvent.keyDown(item, { key: " " });

    expect(keyDowns).toBe(2);
    expect(activations).toBe(1);
  });
});
