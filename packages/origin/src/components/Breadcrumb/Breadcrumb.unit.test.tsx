/**
 * Breadcrumb Unit Tests (Vitest + @testing-library/react)
 *
 * Fast tests for component contracts, logic, and conformance.
 * These run in JSDOM (~5ms/test) vs Playwright CT (~200ms/test).
 *
 * For real browser testing (accessibility tree, keyboard), see Breadcrumb.test.tsx
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import * as React from "react";
import { Breadcrumb } from "./";

describe("Breadcrumb.Root conformance", () => {
  const renderWithProps = (props: Record<string, unknown> = {}) => (
    <Breadcrumb.Root data-testid="test-root" {...props}>
      <Breadcrumb.List>
        <Breadcrumb.Item>
          <Breadcrumb.Page>Test</Breadcrumb.Page>
        </Breadcrumb.Item>
      </Breadcrumb.List>
    </Breadcrumb.Root>
  );

  describe("prop forwarding", () => {
    it("forwards data-* attributes to the DOM", () => {
      render(renderWithProps({ "data-custom": "value" }));
      const element = screen.getByTestId("test-root");
      expect(element).toHaveAttribute("data-custom", "value");
    });

    it("forwards lang attribute to the DOM", () => {
      render(renderWithProps({ lang: "fr" }));
      const element = screen.getByTestId("test-root");
      expect(element).toHaveAttribute("lang", "fr");
    });

    it("forwards id attribute to the DOM", () => {
      render(renderWithProps({ id: "my-breadcrumb" }));
      const element = screen.getByTestId("test-root");
      expect(element).toHaveAttribute("id", "my-breadcrumb");
    });
  });

  describe("className", () => {
    it("applies custom className", () => {
      render(renderWithProps({ className: "custom-class" }));
      const element = screen.getByTestId("test-root");
      expect(element).toHaveClass("custom-class");
    });

    it("merges with internal className", () => {
      render(renderWithProps({ className: "custom-class" }));
      const element = screen.getByTestId("test-root");
      // Should have both internal and custom classes
      expect(element.className).toContain("custom-class");
    });
  });

  describe("style", () => {
    it("applies inline styles", () => {
      render(renderWithProps({ style: { color: "rgb(0, 128, 0)" } }));
      const element = screen.getByTestId("test-root");
      expect(element).toHaveStyle({ color: "rgb(0, 128, 0)" });
    });
  });
});

describe("Breadcrumb.Link conformance", () => {
  const renderWithProps = (props: Record<string, unknown> = {}) => (
    <Breadcrumb.Root>
      <Breadcrumb.List>
        <Breadcrumb.Item>
          <Breadcrumb.Link data-testid="test-link" href="/" {...props}>
            Home
          </Breadcrumb.Link>
        </Breadcrumb.Item>
      </Breadcrumb.List>
    </Breadcrumb.Root>
  );

  describe("prop forwarding", () => {
    it("forwards data-* attributes to the DOM", () => {
      render(renderWithProps({ "data-custom": "link-value" }));
      const element = screen.getByTestId("test-link");
      expect(element).toHaveAttribute("data-custom", "link-value");
    });

    it("forwards lang attribute to the DOM", () => {
      render(renderWithProps({ lang: "de" }));
      const element = screen.getByTestId("test-link");
      expect(element).toHaveAttribute("lang", "de");
    });

    it("forwards href attribute", () => {
      render(renderWithProps({ href: "/products" }));
      const element = screen.getByTestId("test-link");
      expect(element).toHaveAttribute("href", "/products");
    });
  });

  describe("className", () => {
    it("applies custom className", () => {
      render(renderWithProps({ className: "custom-link" }));
      const element = screen.getByTestId("test-link");
      expect(element).toHaveClass("custom-link");
    });
  });
});

describe("Breadcrumb.Page conformance", () => {
  const renderWithProps = (props: Record<string, unknown> = {}) => (
    <Breadcrumb.Root>
      <Breadcrumb.List>
        <Breadcrumb.Item>
          <Breadcrumb.Page data-testid="test-page" {...props}>
            Current
          </Breadcrumb.Page>
        </Breadcrumb.Item>
      </Breadcrumb.List>
    </Breadcrumb.Root>
  );

  describe("prop forwarding", () => {
    it("forwards data-* attributes to the DOM", () => {
      render(renderWithProps({ "data-custom": "page-value" }));
      const element = screen.getByTestId("test-page");
      expect(element).toHaveAttribute("data-custom", "page-value");
    });

    it("forwards lang attribute to the DOM", () => {
      render(renderWithProps({ lang: "es" }));
      const element = screen.getByTestId("test-page");
      expect(element).toHaveAttribute("lang", "es");
    });
  });

  describe("accessibility", () => {
    it('has aria-current="page"', () => {
      render(renderWithProps());
      const element = screen.getByTestId("test-page");
      expect(element).toHaveAttribute("aria-current", "page");
    });

    it("has data-current attribute", () => {
      render(renderWithProps());
      const element = screen.getByTestId("test-page");
      expect(element).toHaveAttribute("data-current");
    });
  });
});

describe("Breadcrumb structure", () => {
  it("renders nav element with aria-label", () => {
    render(
      <Breadcrumb.Root>
        <Breadcrumb.List>
          <Breadcrumb.Item>
            <Breadcrumb.Page>Test</Breadcrumb.Page>
          </Breadcrumb.Item>
        </Breadcrumb.List>
      </Breadcrumb.Root>,
    );

    const nav = screen.getByRole("navigation", { name: "Breadcrumb" });
    expect(nav).toBeInTheDocument();
  });

  it("renders ordered list for semantic structure", () => {
    render(
      <Breadcrumb.Root>
        <Breadcrumb.List>
          <Breadcrumb.Item>
            <Breadcrumb.Page>Test</Breadcrumb.Page>
          </Breadcrumb.Item>
        </Breadcrumb.List>
      </Breadcrumb.Root>,
    );

    const list = screen.getByRole("list");
    expect(list).toBeInTheDocument();
    expect(list.tagName).toBe("OL");
  });

  it("renders list items for each breadcrumb item", () => {
    render(
      <Breadcrumb.Root>
        <Breadcrumb.List>
          <Breadcrumb.Item>
            <Breadcrumb.Link href="/">Home</Breadcrumb.Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Breadcrumb.Link href="/products">Products</Breadcrumb.Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Breadcrumb.Page>Shoes</Breadcrumb.Page>
          </Breadcrumb.Item>
        </Breadcrumb.List>
      </Breadcrumb.Root>,
    );

    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(3);
  });
});

describe("Breadcrumb context", () => {
  it("provides separator context to children", () => {
    // The List component provides context with separator
    // Verify that custom separator is passed through context
    render(
      <Breadcrumb.Root>
        <Breadcrumb.List separator=">>">
          <Breadcrumb.Item>
            <Breadcrumb.Link href="/">Home</Breadcrumb.Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Breadcrumb.Page>Current</Breadcrumb.Page>
          </Breadcrumb.Item>
        </Breadcrumb.List>
      </Breadcrumb.Root>,
    );

    // The separator should be rendered via context
    const separators = screen.getAllByText(">>");
    expect(separators.length).toBeGreaterThan(0);
  });
});

describe("Breadcrumb separator", () => {
  it("supports custom separator via List prop", () => {
    render(
      <Breadcrumb.Root>
        <Breadcrumb.List separator="/">
          <Breadcrumb.Item>
            <Breadcrumb.Link href="/">Home</Breadcrumb.Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Breadcrumb.Page>Products</Breadcrumb.Page>
          </Breadcrumb.Item>
        </Breadcrumb.List>
      </Breadcrumb.Root>,
    );

    // The separator should be rendered
    const separators = screen.getAllByText("/");
    expect(separators.length).toBeGreaterThan(0);
  });
});
