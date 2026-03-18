/**
 * Sidebar Unit Tests (Vitest + @testing-library/react)
 *
 * Fast tests for utility functions, context behavior, and state management.
 * These run in JSDOM (~5ms/test) vs Playwright CT (~200ms/test).
 *
 * For real browser testing (accessibility, keyboard navigation), see Sidebar.test.tsx
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import * as React from "react";
import { Sidebar } from "./";

describe("mergeRenderProps", () => {
  describe("preserves render element props", () => {
    it("preserves data-* attributes from render element", () => {
      render(
        <Sidebar.Root>
          <Sidebar.Content>
            <Sidebar.Menu>
              <Sidebar.Item
                render={<a href="/" data-testid="link" data-custom="value" />}
              >
                Home
              </Sidebar.Item>
            </Sidebar.Menu>
          </Sidebar.Content>
        </Sidebar.Root>,
      );

      const link = screen.getByTestId("link");
      expect(link).toHaveAttribute("data-custom", "value");
    });

    it("preserves href from render element", () => {
      render(
        <Sidebar.Root>
          <Sidebar.Content>
            <Sidebar.Menu>
              <Sidebar.Item render={<a href="/dashboard" data-testid="link" />}>
                Dashboard
              </Sidebar.Item>
            </Sidebar.Menu>
          </Sidebar.Content>
        </Sidebar.Root>,
      );

      const link = screen.getByTestId("link");
      expect(link).toHaveAttribute("href", "/dashboard");
    });

    it("preserves aria-* attributes from render element", () => {
      render(
        <Sidebar.Root>
          <Sidebar.Content>
            <Sidebar.Menu>
              <Sidebar.Item
                render={
                  <a href="/" data-testid="link" aria-describedby="tooltip" />
                }
              >
                Home
              </Sidebar.Item>
            </Sidebar.Menu>
          </Sidebar.Content>
        </Sidebar.Root>,
      );

      const link = screen.getByTestId("link");
      expect(link).toHaveAttribute("aria-describedby", "tooltip");
    });
  });

  describe("merges className", () => {
    it("combines internal and render element classNames", () => {
      render(
        <Sidebar.Root>
          <Sidebar.Content>
            <Sidebar.Menu>
              <Sidebar.Item
                render={
                  <a href="/" data-testid="link" className="custom-link" />
                }
              >
                Home
              </Sidebar.Item>
            </Sidebar.Menu>
          </Sidebar.Content>
        </Sidebar.Root>,
      );

      const link = screen.getByTestId("link");
      expect(link.className).toContain("custom-link");
    });
  });

  describe("merges style", () => {
    it("combines internal and render element styles", () => {
      render(
        <Sidebar.Root>
          <Sidebar.Content>
            <Sidebar.Menu>
              <Sidebar.Item
                render={
                  <a href="/" data-testid="link" style={{ color: "red" }} />
                }
              >
                Home
              </Sidebar.Item>
            </Sidebar.Menu>
          </Sidebar.Content>
        </Sidebar.Root>,
      );

      const link = screen.getByTestId("link");
      expect(link).toHaveStyle({ color: "rgb(255, 0, 0)" });
    });
  });

  describe("merges onClick", () => {
    it("calls both render element onClick and internal onClick", () => {
      const customOnClick = vi.fn();

      render(
        <Sidebar.Root>
          <Sidebar.Content>
            <Sidebar.Menu>
              <Sidebar.ExpandableItem
                label="Settings"
                render={<button data-testid="button" onClick={customOnClick} />}
              >
                <Sidebar.SubmenuItem>Profile</Sidebar.SubmenuItem>
              </Sidebar.ExpandableItem>
            </Sidebar.Menu>
          </Sidebar.Content>
        </Sidebar.Root>,
      );

      const button = screen.getByTestId("button");
      fireEvent.click(button);

      expect(customOnClick).toHaveBeenCalledTimes(1);
    });

    it("calls render onClick before internal onClick", () => {
      const callOrder: string[] = [];

      render(
        <Sidebar.Root>
          <Sidebar.Content>
            <Sidebar.Menu>
              <Sidebar.ExpandableItem
                label="Settings"
                onOpenChange={() => callOrder.push("internal")}
                render={
                  <button
                    data-testid="button"
                    onClick={() => callOrder.push("custom")}
                  />
                }
              >
                <Sidebar.SubmenuItem>Profile</Sidebar.SubmenuItem>
              </Sidebar.ExpandableItem>
            </Sidebar.Menu>
          </Sidebar.Content>
        </Sidebar.Root>,
      );

      const button = screen.getByTestId("button");
      fireEvent.click(button);

      expect(callOrder).toEqual(["custom", "internal"]);
    });
  });
});

describe("TreeContext", () => {
  describe("role assignment", () => {
    it("Item does not hardcode role", () => {
      render(
        <Sidebar.Root>
          <Sidebar.Content>
            <Sidebar.Menu>
              <Sidebar.Item>Dashboard</Sidebar.Item>
            </Sidebar.Menu>
          </Sidebar.Content>
        </Sidebar.Root>,
      );

      const item = screen.getByRole("button", { name: "Dashboard" });
      expect(item).not.toHaveAttribute("role");
    });

    it("SubmenuItem does not hardcode role", () => {
      render(
        <Sidebar.Root>
          <Sidebar.Content>
            <Sidebar.Menu>
              <Sidebar.ExpandableItem label="Settings" defaultOpen>
                <Sidebar.SubmenuItem>Profile</Sidebar.SubmenuItem>
              </Sidebar.ExpandableItem>
            </Sidebar.Menu>
          </Sidebar.Content>
        </Sidebar.Root>,
      );

      const item = screen.getByRole("button", { name: "Profile" });
      expect(item).not.toHaveAttribute("role");
    });

    it("TreeItem does not hardcode role", () => {
      render(
        <Sidebar.Root>
          <Sidebar.Content>
            <Sidebar.Menu>
              <Sidebar.TreeItem label="Nested">
                <Sidebar.SubmenuItem>Child</Sidebar.SubmenuItem>
              </Sidebar.TreeItem>
            </Sidebar.Menu>
          </Sidebar.Content>
        </Sidebar.Root>,
      );

      const item = screen.getByRole("button", { name: "Nested" });
      expect(item).not.toHaveAttribute("role");
    });
  });

  describe("Tree component", () => {
    it('has role="tree"', () => {
      render(
        <Sidebar.Root>
          <Sidebar.Content>
            <Sidebar.Tree label="Project files">
              <Sidebar.TreeItem label="src">
                <Sidebar.SubmenuItem>index.ts</Sidebar.SubmenuItem>
              </Sidebar.TreeItem>
            </Sidebar.Tree>
          </Sidebar.Content>
        </Sidebar.Root>,
      );

      const tree = screen.getByRole("tree", { name: "Project files" });
      expect(tree).toBeInTheDocument();
    });

    it("has default aria-label", () => {
      render(
        <Sidebar.Root>
          <Sidebar.Content>
            <Sidebar.Tree>
              <Sidebar.Item>File</Sidebar.Item>
            </Sidebar.Tree>
          </Sidebar.Content>
        </Sidebar.Root>,
      );

      const tree = screen.getByRole("tree", { name: "File tree" });
      expect(tree).toBeInTheDocument();
    });
  });
});

describe("Controlled/Uncontrolled state", () => {
  describe("Root component", () => {
    it("works as uncontrolled with no props", () => {
      render(
        <Sidebar.Root data-testid="sidebar">
          <Sidebar.Header>
            <Sidebar.Trigger data-testid="trigger" />
          </Sidebar.Header>
          <Sidebar.Content>
            <Sidebar.Menu>
              <Sidebar.Item>Home</Sidebar.Item>
            </Sidebar.Menu>
          </Sidebar.Content>
        </Sidebar.Root>,
      );

      const sidebar = screen.getByTestId("sidebar");
      expect(sidebar).toHaveAttribute("data-collapsed", "false");

      const trigger = screen.getByTestId("trigger");
      fireEvent.click(trigger);

      expect(sidebar).toHaveAttribute("data-collapsed", "true");
    });

    it("works as controlled with collapsed={false}", () => {
      const onCollapsedChange = vi.fn();

      render(
        <Sidebar.Root
          data-testid="sidebar"
          collapsed={false}
          onCollapsedChange={onCollapsedChange}
        >
          <Sidebar.Header>
            <Sidebar.Trigger data-testid="trigger" />
          </Sidebar.Header>
          <Sidebar.Content>
            <Sidebar.Menu>
              <Sidebar.Item>Home</Sidebar.Item>
            </Sidebar.Menu>
          </Sidebar.Content>
        </Sidebar.Root>,
      );

      const sidebar = screen.getByTestId("sidebar");
      expect(sidebar).toHaveAttribute("data-collapsed", "false");

      const trigger = screen.getByTestId("trigger");
      fireEvent.click(trigger);

      // Should call onCollapsedChange but NOT update internal state
      expect(onCollapsedChange).toHaveBeenCalledWith(true);
      expect(sidebar).toHaveAttribute("data-collapsed", "false");
    });

    it("works as controlled with collapsed={true}", () => {
      const onCollapsedChange = vi.fn();

      render(
        <Sidebar.Root
          data-testid="sidebar"
          collapsed={true}
          onCollapsedChange={onCollapsedChange}
        >
          <Sidebar.Header>
            <Sidebar.Trigger data-testid="trigger" />
          </Sidebar.Header>
          <Sidebar.Content>
            <Sidebar.Menu>
              <Sidebar.Item>Home</Sidebar.Item>
            </Sidebar.Menu>
          </Sidebar.Content>
        </Sidebar.Root>,
      );

      const sidebar = screen.getByTestId("sidebar");
      expect(sidebar).toHaveAttribute("data-collapsed", "true");

      const trigger = screen.getByTestId("trigger");
      fireEvent.click(trigger);

      expect(onCollapsedChange).toHaveBeenCalledWith(false);
      expect(sidebar).toHaveAttribute("data-collapsed", "true");
    });
  });

  describe("Provider component", () => {
    it("works as controlled with collapsed={false}", () => {
      const onCollapsedChange = vi.fn();

      render(
        <Sidebar.Provider
          collapsed={false}
          onCollapsedChange={onCollapsedChange}
        >
          <Sidebar.Root data-testid="sidebar">
            <Sidebar.Header>
              <Sidebar.Trigger data-testid="trigger" />
            </Sidebar.Header>
            <Sidebar.Content>
              <Sidebar.Menu>
                <Sidebar.Item>Home</Sidebar.Item>
              </Sidebar.Menu>
            </Sidebar.Content>
          </Sidebar.Root>
        </Sidebar.Provider>,
      );

      const sidebar = screen.getByTestId("sidebar");
      expect(sidebar).toHaveAttribute("data-collapsed", "false");

      const trigger = screen.getByTestId("trigger");
      fireEvent.click(trigger);

      expect(onCollapsedChange).toHaveBeenCalledWith(true);
    });
  });

  describe("ExpandableItem", () => {
    it("works as uncontrolled with defaultOpen", () => {
      render(
        <Sidebar.Root>
          <Sidebar.Content>
            <Sidebar.Menu>
              <Sidebar.ExpandableItem label="Settings" defaultOpen>
                <Sidebar.SubmenuItem data-testid="submenu-item">
                  Profile
                </Sidebar.SubmenuItem>
              </Sidebar.ExpandableItem>
            </Sidebar.Menu>
          </Sidebar.Content>
        </Sidebar.Root>,
      );

      expect(screen.getByTestId("submenu-item")).toBeVisible();
    });

    it("works as controlled with open={false}", () => {
      const onOpenChange = vi.fn();

      render(
        <Sidebar.Root>
          <Sidebar.Content>
            <Sidebar.Menu>
              <Sidebar.ExpandableItem
                label="Settings"
                open={false}
                onOpenChange={onOpenChange}
              >
                <Sidebar.SubmenuItem data-testid="submenu-item">
                  Profile
                </Sidebar.SubmenuItem>
              </Sidebar.ExpandableItem>
            </Sidebar.Menu>
          </Sidebar.Content>
        </Sidebar.Root>,
      );

      expect(screen.queryByTestId("submenu-item")).not.toBeInTheDocument();

      const button = screen.getByRole("button", { name: "Settings" });
      fireEvent.click(button);

      expect(onOpenChange).toHaveBeenCalledWith(true);
      // Should NOT open because controlled
      expect(screen.queryByTestId("submenu-item")).not.toBeInTheDocument();
    });
  });

  describe("TreeItem", () => {
    it("works as controlled with open={false}", () => {
      const onOpenChange = vi.fn();

      render(
        <Sidebar.Root>
          <Sidebar.Content>
            <Sidebar.Menu>
              <Sidebar.TreeItem
                label="Folder"
                open={false}
                onOpenChange={onOpenChange}
              >
                <Sidebar.SubmenuItem data-testid="child">
                  File
                </Sidebar.SubmenuItem>
              </Sidebar.TreeItem>
            </Sidebar.Menu>
          </Sidebar.Content>
        </Sidebar.Root>,
      );

      expect(screen.queryByTestId("child")).not.toBeInTheDocument();

      const button = screen.getByRole("button", { name: "Folder" });
      fireEvent.click(button);

      expect(onOpenChange).toHaveBeenCalledWith(true);
      expect(screen.queryByTestId("child")).not.toBeInTheDocument();
    });
  });
});

describe("SidebarContext", () => {
  it("propagates collapsed state to children", () => {
    render(
      <Sidebar.Root collapsed={true}>
        <Sidebar.Content>
          <Sidebar.Menu>
            <Sidebar.Item icon={<span>icon</span>}>Home</Sidebar.Item>
          </Sidebar.Menu>
        </Sidebar.Content>
      </Sidebar.Root>,
    );

    // When collapsed, label should not be visible
    expect(screen.queryByText("Home")).not.toBeInTheDocument();
    // But icon should still be visible
    expect(screen.getByText("icon")).toBeInTheDocument();
  });

  it("useSidebar throws when used outside Provider", () => {
    const TestComponent = () => {
      const { collapsed } = Sidebar.useSidebar();
      return <div>{collapsed ? "collapsed" : "expanded"}</div>;
    };

    expect(() => render(<TestComponent />)).toThrow(
      "useSidebar must be used within Sidebar.Provider",
    );
  });
});

describe("Accessibility", () => {
  describe("GroupLabel", () => {
    it("is visually hidden when collapsed", () => {
      render(
        <Sidebar.Root collapsed={true}>
          <Sidebar.Content>
            <Sidebar.Group>
              <Sidebar.GroupLabel data-testid="label">
                Navigation
              </Sidebar.GroupLabel>
              <Sidebar.Menu>
                <Sidebar.Item icon={<span>icon</span>}>Home</Sidebar.Item>
              </Sidebar.Menu>
            </Sidebar.Group>
          </Sidebar.Content>
        </Sidebar.Root>,
      );

      const label = screen.getByTestId("label");
      // Should still be in the DOM for screen readers
      expect(label).toBeInTheDocument();
      // But should have visually hidden class
      expect(label.className).toContain("visuallyHidden");
    });

    it("has correct heading role and level", () => {
      render(
        <Sidebar.Root>
          <Sidebar.Content>
            <Sidebar.Group>
              <Sidebar.GroupLabel>Navigation</Sidebar.GroupLabel>
              <Sidebar.Menu>
                <Sidebar.Item>Home</Sidebar.Item>
              </Sidebar.Menu>
            </Sidebar.Group>
          </Sidebar.Content>
        </Sidebar.Root>,
      );

      const label = screen.getByRole("heading", {
        level: 2,
        name: "Navigation",
      });
      expect(label).toBeInTheDocument();
    });
  });

  describe("ExpandableItem", () => {
    it("has aria-expanded attribute", () => {
      render(
        <Sidebar.Root>
          <Sidebar.Content>
            <Sidebar.Menu>
              <Sidebar.ExpandableItem label="Settings">
                <Sidebar.SubmenuItem>Profile</Sidebar.SubmenuItem>
              </Sidebar.ExpandableItem>
            </Sidebar.Menu>
          </Sidebar.Content>
        </Sidebar.Root>,
      );

      const button = screen.getByRole("button", { name: "Settings" });
      expect(button).toHaveAttribute("aria-expanded", "false");

      fireEvent.click(button);
      expect(button).toHaveAttribute("aria-expanded", "true");
    });

    it("has aria-controls pointing to submenu", () => {
      render(
        <Sidebar.Root>
          <Sidebar.Content>
            <Sidebar.Menu>
              <Sidebar.ExpandableItem label="Settings" defaultOpen>
                <Sidebar.SubmenuItem>Profile</Sidebar.SubmenuItem>
              </Sidebar.ExpandableItem>
            </Sidebar.Menu>
          </Sidebar.Content>
        </Sidebar.Root>,
      );

      const button = screen.getByRole("button", { name: "Settings" });
      const submenuId = button.getAttribute("aria-controls");
      expect(submenuId).toBeTruthy();

      const submenu = document.getElementById(submenuId!);
      expect(submenu).toBeInTheDocument();
      expect(submenu).toHaveAttribute("role", "menu");
    });
  });

  describe("Item", () => {
    it('has aria-current="page" when active', () => {
      render(
        <Sidebar.Root>
          <Sidebar.Content>
            <Sidebar.Menu>
              <Sidebar.Item active>Dashboard</Sidebar.Item>
            </Sidebar.Menu>
          </Sidebar.Content>
        </Sidebar.Root>,
      );

      const item = screen.getByRole("button", { name: "Dashboard" });
      expect(item).toHaveAttribute("aria-current", "page");
    });

    it("does not have aria-current when not active", () => {
      render(
        <Sidebar.Root>
          <Sidebar.Content>
            <Sidebar.Menu>
              <Sidebar.Item>Dashboard</Sidebar.Item>
            </Sidebar.Menu>
          </Sidebar.Content>
        </Sidebar.Root>,
      );

      const item = screen.getByRole("button", { name: "Dashboard" });
      expect(item).not.toHaveAttribute("aria-current");
    });
  });

  describe("Trigger", () => {
    it("has aria-expanded reflecting collapsed state", () => {
      render(
        <Sidebar.Root>
          <Sidebar.Header>
            <Sidebar.Trigger data-testid="trigger" />
          </Sidebar.Header>
          <Sidebar.Content>
            <Sidebar.Menu>
              <Sidebar.Item>Home</Sidebar.Item>
            </Sidebar.Menu>
          </Sidebar.Content>
        </Sidebar.Root>,
      );

      const trigger = screen.getByTestId("trigger");
      // When sidebar is expanded, aria-expanded should be true
      expect(trigger).toHaveAttribute("aria-expanded", "true");

      fireEvent.click(trigger);
      // When sidebar is collapsed, aria-expanded should be false
      expect(trigger).toHaveAttribute("aria-expanded", "false");
    });

    it("has accessible label", () => {
      render(
        <Sidebar.Root>
          <Sidebar.Header>
            <Sidebar.Trigger />
          </Sidebar.Header>
          <Sidebar.Content>
            <Sidebar.Menu>
              <Sidebar.Item>Home</Sidebar.Item>
            </Sidebar.Menu>
          </Sidebar.Content>
        </Sidebar.Root>,
      );

      const trigger = screen.getByRole("button", { name: "Collapse sidebar" });
      expect(trigger).toBeInTheDocument();

      fireEvent.click(trigger);

      const expandTrigger = screen.getByRole("button", {
        name: "Expand sidebar",
      });
      expect(expandTrigger).toBeInTheDocument();
    });
  });
});

describe("Prop forwarding", () => {
  it("forwards data-* attributes to Root", () => {
    render(
      <Sidebar.Root data-testid="sidebar" data-custom="value">
        <Sidebar.Content>
          <Sidebar.Menu>
            <Sidebar.Item>Home</Sidebar.Item>
          </Sidebar.Menu>
        </Sidebar.Content>
      </Sidebar.Root>,
    );

    const sidebar = screen.getByTestId("sidebar");
    expect(sidebar).toHaveAttribute("data-custom", "value");
  });

  it("forwards className to Item", () => {
    render(
      <Sidebar.Root>
        <Sidebar.Content>
          <Sidebar.Menu>
            <Sidebar.Item data-testid="item" className="custom-class">
              Home
            </Sidebar.Item>
          </Sidebar.Menu>
        </Sidebar.Content>
      </Sidebar.Root>,
    );

    const item = screen.getByTestId("item");
    expect(item).toHaveClass("custom-class");
  });

  it("forwards style to Item", () => {
    render(
      <Sidebar.Root>
        <Sidebar.Content>
          <Sidebar.Menu>
            <Sidebar.Item data-testid="item" style={{ color: "red" }}>
              Home
            </Sidebar.Item>
          </Sidebar.Menu>
        </Sidebar.Content>
      </Sidebar.Root>,
    );

    const item = screen.getByTestId("item");
    expect(item).toHaveStyle({ color: "rgb(255, 0, 0)" });
  });
});
