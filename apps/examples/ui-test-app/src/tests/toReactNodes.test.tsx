import {
  setReactNodesTypography,
  toReactNodes,
} from "@lightsparkdev/ui/utils/toReactNodes";
import { render } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { TestAppRoutes } from "../types";

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
    const result = toReactNodes({
      text: "Test",
      to: TestAppRoutes.PageOne,
    });
    const { asFragment } = render(<BrowserRouter>{result}</BrowserRouter>);

    expect(asFragment()).toMatchInlineSnapshot(`
      <DocumentFragment>
        <a
          class="css-0"
          href="/test-app-page-one"
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
      { text: "Test", to: TestAppRoutes.PageOne },
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
          href="/test-app-page-one"
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
      { text: "Test", to: TestAppRoutes.PageOne },
      { text: "Test 2", to: TestAppRoutes.PageTwo },
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
          href="/test-app-page-one"
        >
          Test
        </a>
        <a
          class="css-0"
          href="/test-app-page-two"
        >
          Test 2
        </a>
        <br />
        test3
      </DocumentFragment>
    `);
  });

  it("should have type errors when arguments do not match inferred types", () => {
    toReactNodes([
      {
        /* @ts-expect-error `/testsf` is not a valid TestAppRoutes */
        to: "/testsf",
        text: "Hello",
        /* @ts-expect-error `contnt` is not a valid prop for the Display component */
        typography: { type: "Display", props: { contnt: "Something" } },
      },
    ]);
  });

  it("should correctly add typography to nontypographic nodes", () => {
    const stringNode = "Some string that should have typography applied";
    const linkNode = {
      text: "Some link node that should have typography applied",
      to: TestAppRoutes.PageOne,
    };
    const iconNode = { icon: "LogoBolt" as const };
    const externalLinkNode = {
      text: "Some external link node that should have typography applied",
      externalLink: "https://www.google.com",
    };
    const nextLinkNode = {
      text: "Some next link node that should have typography applied",
      nextHref: "https://www.google.com",
    };
    const textNode = {
      text: "Some text node that should have typography applied",
    };

    const nodes = setReactNodesTypography(
      [
        stringNode,
        linkNode,
        iconNode,
        externalLinkNode,
        nextLinkNode,
        textNode,
      ],
      {
        link: { type: "Body" },
        externalLink: { type: "Body" },
        text: { type: "Body", props: { size: "Large" } },
        nextLink: { type: "Body" },
      },
    );

    expect(nodes).toEqual([
      {
        text: stringNode,
        typography: { type: "Body", props: { size: "Large" } },
      },
      {
        ...linkNode,
        typography: { type: "Body" },
      },
      iconNode,
      {
        ...externalLinkNode,
        typography: { type: "Body" },
      },
      {
        ...nextLinkNode,
        typography: { type: "Body" },
      },
      {
        ...textNode,
        typography: { type: "Body", props: { size: "Large" } },
      },
    ]);
  });

  it("should correctly change the typography of typographic nodes", () => {
    const stringNode = "Some string that should have typography applied";
    const linkNode = {
      text: "Some link node that should have typography applied",
      to: TestAppRoutes.PageOne,
      typography: { type: "Display", props: { size: "Medium" } },
    };
    const iconNode = { icon: "LogoBolt" as const };
    const externalLinkNode = {
      text: "Some external link node that should have typography applied",
      externalLink: "https://www.google.com",
      typography: { type: "Title", props: { size: "Small" } },
    };
    const nextLinkNode = {
      text: "Some next link node that should have typography applied",
      nextHref: "https://www.google.com",
      typography: { type: "Display", props: { size: "Large" } },
    };
    const textNode = {
      text: "Some text node that should have typography applied",
      typography: { type: "Label", props: { size: "Small" } },
    };

    const nodes = setReactNodesTypography(
      [
        stringNode,
        linkNode,
        iconNode,
        externalLinkNode,
        nextLinkNode,
        textNode,
      ],
      {
        link: { type: "Body" },
        externalLink: { type: "Body" },
        text: { type: "Body", props: { size: "Large" } },
        nextLink: { type: "Body" },
      },
    );

    expect(nodes).toEqual([
      {
        text: stringNode,
        typography: { type: "Body", props: { size: "Large" } },
      },
      {
        ...linkNode,
        typography: { type: "Body" },
      },
      iconNode,
      {
        ...externalLinkNode,
        typography: { type: "Body" },
      },
      {
        ...nextLinkNode,
        typography: { type: "Body" },
      },
      {
        ...textNode,
        typography: { type: "Body", props: { size: "Large" } },
      },
    ]);
  });

  it("should not change the typography of typographic nodes when no override is provided for the node type", () => {
    const stringNode = "Some string that should have typography applied";
    const linkNode = {
      text: "Some link node that should have typography applied",
      to: TestAppRoutes.PageOne,
      typography: { type: "Display", props: { size: "Medium" } },
    };
    const textNode = {
      text: "Some text node that should have typography applied",
      typography: { type: "Label", props: { size: "Small" } },
    };

    const nodes = setReactNodesTypography([stringNode, linkNode, textNode], {
      link: { type: "Body", props: { size: "Large" } },
    });

    expect(nodes).toEqual([
      stringNode,
      {
        ...linkNode,
        typography: { type: "Body", props: { size: "Large" } },
      },
      {
        ...textNode,
        typography: { type: "Label", props: { size: "Small" } },
      },
    ]);
  });
});
