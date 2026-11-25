import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Content, Header } from "./parts";

describe("Dialog structural parts", () => {
  afterEach(cleanup);

  it("preserves direct header children without leading content", () => {
    render(
      <Header data-testid="header">
        <span>Title</span>
        <span>Description</span>
      </Header>,
    );

    const header = screen.getByTestId("header");
    expect(header.children).toHaveLength(2);
    expect(header.children[0]?.textContent).toBe("Title");
    expect(header.children[1]?.textContent).toBe("Description");
  });

  it("renders leading content before the title and description group", () => {
    render(
      <Header
        data-testid="header"
        leading={<button type="button">Back</button>}
      >
        <span>Title</span>
        <span>Description</span>
      </Header>,
    );

    const header = screen.getByTestId("header");
    expect(header.children).toHaveLength(2);
    expect(header.children[0]?.textContent).toBe("Back");
    expect(header.children[1]?.children).toHaveLength(2);
    expect(header.children[1]?.textContent).toBe("TitleDescription");
  });

  it("renders numeric zero as leading content", () => {
    render(
      <Header data-testid="header" leading={0}>
        <span>Title</span>
      </Header>,
    );

    const header = screen.getByTestId("header");
    expect(header.children[0]?.textContent).toBe("0");
    expect(header.children[1]?.textContent).toBe("Title");
  });

  it("does not forward fullBleed to the content element", () => {
    const { rerender } = render(
      <Content data-testid="content" fullBleed={false}>
        Content
      </Content>,
    );
    expect(screen.getByTestId("content")).not.toHaveAttribute("fullBleed");

    rerender(
      <Content data-testid="content" fullBleed>
        Content
      </Content>,
    );
    expect(screen.getByTestId("content")).not.toHaveAttribute("fullBleed");
  });
});
