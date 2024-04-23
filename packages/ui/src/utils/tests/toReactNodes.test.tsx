import { render } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { toReactNodes } from "../toReactNodes";

describe("toReactNodes", () => {
  it("renders the expected output for a single string", () => {
    const result = toReactNodes("test1\ntest2");
    const { asFragment } = render(result);

    expect(asFragment()).toMatchInlineSnapshot(`
      <DocumentFragment>
        test1
        <br />
        test2
      </DocumentFragment>
    `);
  });

  it("renders the expected output for a single link", () => {
    const result = toReactNodes({ type: "link", text: "Test", to: "/test" });
    const { asFragment } = render(<BrowserRouter>{result}</BrowserRouter>);

    expect(asFragment()).toMatchInlineSnapshot(`
      <DocumentFragment>
        <a
          class="css-0"
          href="/test"
        >
          Test
        </a>
      </DocumentFragment>
    `);
  });

  it("renders the expected output for a single string array with line breaks", () => {
    const result = toReactNodes(["test1\ntest2\ntest3"]);
    const { asFragment } = render(result);

    expect(asFragment()).toMatchInlineSnapshot(`
      <DocumentFragment>
        test1
        <br />
        test2
        <br />
        test3
      </DocumentFragment>
    `);
  });

  it("renders the expected output for a single string array with consecutive line breaks", () => {
    const result = toReactNodes(["test1\n\ntest2\ntest3"]);
    const { asFragment } = render(result);

    expect(asFragment()).toMatchInlineSnapshot(`
      <DocumentFragment>
        test1
        <br />
        <br />
        test2
        <br />
        test3
      </DocumentFragment>
    `);
  });

  it("renders the expected output for multiple string array", () => {
    const result = toReactNodes(["test1", "test2", "test3"]);
    const { asFragment } = render(result);

    expect(asFragment()).toMatchInlineSnapshot(`
      <DocumentFragment>
        test1test2test3
      </DocumentFragment>
    `);
  });

  it("renders the expected output for multiple string array and line breaks", () => {
    const result = toReactNodes(["test1\n", "test2\n", "test3"]);
    const { asFragment } = render(result);

    expect(asFragment()).toMatchInlineSnapshot(`
      <DocumentFragment>
        test1
        <br />
        test2
        <br />
        test3
      </DocumentFragment>
    `);
  });

  it("renders the expected output for multiple string array, line breaks, and links", () => {
    const result = toReactNodes([
      "test1\n",
      "test2\n",
      { type: "link", text: "Test", to: "/test" },
      "\n",
      "test3",
    ]);
    const { asFragment } = render(<BrowserRouter>{result}</BrowserRouter>);

    expect(asFragment()).toMatchInlineSnapshot(`
      <DocumentFragment>
        test1
        <br />
        test2
        <br />
        <a
          class="css-0"
          href="/test"
        >
          Test
        </a>
        <br />
        test3
      </DocumentFragment>
    `);
  });

  it("renders the expected output for multiple links", () => {
    const result = toReactNodes([
      "test1\n",
      "test2\n",
      { type: "link", text: "Test", to: "/test" },
      { type: "link", text: "Test 2", to: "/test-2" },
      "\n",
      "test3",
    ]);
    const { asFragment } = render(<BrowserRouter>{result}</BrowserRouter>);

    expect(asFragment()).toMatchInlineSnapshot(`
      <DocumentFragment>
        test1
        <br />
        test2
        <br />
        <a
          class="css-0"
          href="/test"
        >
          Test
        </a>
        <a
          class="css-0"
          href="/test-2"
        >
          Test 2
        </a>
        <br />
        test3
      </DocumentFragment>
    `);
  });
});
