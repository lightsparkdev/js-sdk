import { matchers } from "@emotion/jest";
import styled from "@emotion/styled";
import { LinkBase } from "@lightsparkdev/ui/router";
import { screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { TestAppRoutes } from "../types";
import { render } from "./render";

expect.extend(matchers);

const ComposedLink = styled(LinkBase)({
  color: "rgb(12, 34, 56)",
});

describe("LinkBase color", () => {
  test("inherits text color by default", () => {
    render(
      <MemoryRouter
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <div style={{ color: "rgb(1, 2, 3)" }}>
          <LinkBase to={TestAppRoutes.PageOne}>Default link</LinkBase>
        </div>
      </MemoryRouter>,
    );

    const link = screen.getByRole("link", { name: "Default link" });
    expect(link).toHaveStyleRule("color", "inherit");
    expect(link.style.color).toBe("");
  });

  test("lets composed styles override the inherited color", () => {
    render(
      <MemoryRouter
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <ComposedLink to={TestAppRoutes.PageOne}>Composed link</ComposedLink>
      </MemoryRouter>,
    );

    expect(
      getComputedStyle(screen.getByRole("link", { name: "Composed link" }))
        .color,
    ).toBe("rgb(12, 34, 56)");
  });

  test("renders a disabled link without an href", () => {
    render(
      <MemoryRouter
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <LinkBase to={TestAppRoutes.PageOne} disabled>
          Disabled link
        </LinkBase>
      </MemoryRouter>,
    );

    const link = screen.getByText("Disabled link");
    expect(link.tagName).toBe("A");
    expect(link).not.toHaveAttribute("href");
    expect(link).toHaveAttribute("aria-disabled", "true");
  });

  test("renders a non-navigable anchor when only aria-disabled is set", () => {
    render(
      <MemoryRouter
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <LinkBase to={TestAppRoutes.PageOne} aria-disabled>
          Aria disabled link
        </LinkBase>
      </MemoryRouter>,
    );

    const link = screen.getByText("Aria disabled link");
    expect(link.tagName).toBe("A");
    expect(link).not.toHaveAttribute("href");
    expect(link).toHaveAttribute("aria-disabled", "true");
  });

  test("preserves explicit blue color", () => {
    render(
      <MemoryRouter
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <ComposedLink to={TestAppRoutes.PageOne} blue>
          Blue link
        </ComposedLink>
      </MemoryRouter>,
    );

    expect(
      getComputedStyle(screen.getByRole("link", { name: "Blue link" })).color,
    ).toBe("rgb(20, 91, 198)");
  });
});
