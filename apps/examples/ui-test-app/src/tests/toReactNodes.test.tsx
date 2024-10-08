import { createSerializer } from "@emotion/jest";
import {
  setDefaultReactNodesTypography,
  setReactNodesTypography,
} from "@lightsparkdev/ui/utils/toReactNodes/setReactNodesTypography";
import { toReactNodes } from "@lightsparkdev/ui/utils/toReactNodes/toReactNodes";
import { render } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { TestAppRoutes } from "../types";

expect.addSnapshotSerializer(
  createSerializer({
    classNameReplacer(className, index) {
      return "css-test";
    },
  }),
);

describe("toReactNodes", () => {
  it("renders the expected output for a single string", () => {
    const result = toReactNodes("test1\ntest2");
    const { asFragment } = render(result);

    expect(asFragment()).toMatchInlineSnapshot(`
      <DocumentFragment>
        <span>
          <span>
            test1
            <br />
          </span>
          <span>
            test2
          </span>
        </span>
      </DocumentFragment>
    `);
  });

  it("renders the expected output for a single link", () => {
    const result = toReactNodes({
      link: {
        text: "Test",
        to: TestAppRoutes.PageOne,
      },
    });
    const { asFragment } = render(<BrowserRouter>{result}</BrowserRouter>);

    expect(asFragment()).toMatchInlineSnapshot(`
      <DocumentFragment>
        <a
          class="css-test"
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
        <span>
          <span>
            test1
            <br />
          </span>
          <span>
            test2
            <br />
          </span>
          <span>
            test3
          </span>
        </span>
      </DocumentFragment>
    `);
  });

  it("renders the expected output for a single string array with consecutive line breaks", () => {
    const result = toReactNodes(["test1\n\ntest2\ntest3"]);
    const { asFragment } = render(result);

    expect(asFragment()).toMatchInlineSnapshot(`
      <DocumentFragment>
        <span>
          <span>
            test1
            <br />
          </span>
          <span>
            <br />
          </span>
          <span>
            test2
            <br />
          </span>
          <span>
            test3
          </span>
        </span>
      </DocumentFragment>
    `);
  });

  it("renders the expected output for multiple string array", () => {
    const result = toReactNodes(["test1", "test2", "test3"]);
    const { asFragment } = render(result);

    expect(asFragment()).toMatchInlineSnapshot(`
      <DocumentFragment>
        <span>
          <span>
            test1
          </span>
        </span>
        <span>
          <span>
            test2
          </span>
        </span>
        <span>
          <span>
            test3
          </span>
        </span>
      </DocumentFragment>
    `);
  });

  it("renders the expected output for multiple string array and line breaks", () => {
    const result = toReactNodes(["test1\n", "test2\n", "test3"]);
    const { asFragment } = render(result);

    expect(asFragment()).toMatchInlineSnapshot(`
      <DocumentFragment>
        <span>
          <span>
            test1
            <br />
          </span>
        </span>
        <span>
          <span>
            test2
            <br />
          </span>
        </span>
        <span>
          <span>
            test3
          </span>
        </span>
      </DocumentFragment>
    `);
  });

  it("renders the expected output for multiple string array, line breaks, and links", () => {
    const result = toReactNodes([
      "test1\n",
      "test2\n",
      { link: { text: "Test", to: TestAppRoutes.PageOne } },
      "\n",
      "test3",
    ]);
    const { asFragment } = render(<BrowserRouter>{result}</BrowserRouter>);

    expect(asFragment()).toMatchInlineSnapshot(`
      <DocumentFragment>
        <span>
          <span>
            test1
            <br />
          </span>
        </span>
        <span>
          <span>
            test2
            <br />
          </span>
        </span>
        <a
          class="css-test"
          href="/test-app-page-one"
        >
          Test
        </a>
        <span>
          <span>
            <br />
          </span>
        </span>
        <span>
          <span>
            test3
          </span>
        </span>
      </DocumentFragment>
    `);
  });

  it("renders the expected output for multiple links", () => {
    const result = toReactNodes([
      "test1\n",
      "test2\n",
      { link: { text: "Test", to: TestAppRoutes.PageOne } },
      { link: { text: "Test 2", to: TestAppRoutes.PageTwo } },
      "\n",
      "test3",
    ]);
    const { asFragment } = render(<BrowserRouter>{result}</BrowserRouter>);

    expect(asFragment()).toMatchInlineSnapshot(`
      <DocumentFragment>
        <span>
          <span>
            test1
            <br />
          </span>
        </span>
        <span>
          <span>
            test2
            <br />
          </span>
        </span>
        <a
          class="css-test"
          href="/test-app-page-one"
        >
          Test
        </a>
        <a
          class="css-test"
          href="/test-app-page-two"
        >
          Test 2
        </a>
        <span>
          <span>
            <br />
          </span>
        </span>
        <span>
          <span>
            test3
          </span>
        </span>
      </DocumentFragment>
    `);
  });

  it("should have type errors when arguments do not match inferred types", () => {
    toReactNodes([
      {
        link: {
          /* @ts-expect-error `skundfksdnf` is not a valid Link prop */
          skundfksdnf: "ksjndf",
        },
      },
      {
        link: {
          /* @ts-expect-error `/testsf` is not a valid TestAppRoutes */
          to: "/testsf",
          content: "Hello",
        },
      },
      {
        text: "Incorrect typography",
        typography: {
          type: "Body",
          color: "primary",
          size: "Small",
          /* @ts-expect-error `something` is not a valid Body prop */
          something: "ksjndf",
        },
      },
      {
        link: {
          text: "Incorrect typography",
          typography: {
            type: "Headline",
            color: "primary",
            size: "Small",
            /* @ts-expect-error `div` is not a valid Headline heading */
            heading: "div",
          },
        },
      },
      {
        text: "Correct typography",
        typography: {
          type: "Headline",
          color: "primary",
          size: "Small",
          heading: "h1",
        },
      },
    ]);
  });

  it("should correctly add typography to nontypographic nodes", () => {
    const stringNode = "Some string that should have typography applied";
    const linkNode = {
      link: {
        content: "Some link node that should have typography applied",
        to: TestAppRoutes.PageOne,
      },
    };
    const iconNode = { icon: { name: "LogoBolt" as const } };
    const nextLinkNode = {
      nextLink: {
        text: "Some next link node that should have typography applied",
        href: "https://www.google.com",
      },
    };
    const textNode = {
      text: "Some text node that should have typography applied",
    };

    const nodes = setReactNodesTypography(
      [stringNode, linkNode, iconNode, nextLinkNode, textNode],
      {
        link: { type: "Body" },
        text: { type: "Body", size: "Large" },
        nextLink: { type: "Body" },
      },
    );

    expect(nodes).toEqual([
      {
        text: stringNode,
        typography: { type: "Body", size: "Large" },
      },
      {
        link: {
          ...linkNode.link,
          typography: { type: "Body" },
        },
      },
      iconNode,
      {
        nextLink: {
          ...nextLinkNode.nextLink,
          typography: { type: "Body" },
        },
      },
      {
        ...textNode,
        typography: { type: "Body", size: "Large" },
      },
    ]);
  });

  it("should correctly change the typography of typographic nodes", () => {
    const stringNode = "Some string that should have typography applied";
    const linkNode = {
      link: {
        text: "Some link node that should have typography applied",
        to: TestAppRoutes.PageOne,
        typography: { type: "Display", size: "Medium" } as const,
      },
    };
    const iconNode = { icon: { name: "LogoBolt" } as const };
    const externalLinkNode = {
      link: {
        text: "Some external link node that should have typography applied",
        externalLink: "https://www.google.com",
        typography: { type: "Title", size: "Small" } as const,
      },
    };
    const nextLinkNode = {
      nextLink: {
        text: "Some next link node that should have typography applied",
        href: "https://www.google.com",
        typography: { type: "Display", size: "Large" } as const,
      },
    };
    const textNode = {
      text: "Some text node that should have typography applied",
      typography: { type: "Label", size: "Small" } as const,
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
        text: { type: "Body", size: "Large" },
        nextLink: { type: "Body" },
      },
    );

    expect(nodes).toEqual([
      {
        text: stringNode,
        typography: { type: "Body", size: "Large" },
      },
      {
        link: {
          ...linkNode.link,
          typography: { type: "Body" },
        },
      },
      iconNode,
      {
        link: {
          ...externalLinkNode.link,
          typography: { type: "Body" },
        },
      },
      {
        nextLink: {
          ...nextLinkNode.nextLink,
          typography: { type: "Body" },
        },
      },
      {
        ...textNode,
        typography: { type: "Body", size: "Large" },
      },
    ]);
  });

  it("should not change the typography of typographic nodes when no override is provided for the node type", () => {
    const stringNode = "Some string that should not have typography applied";
    const linkNode = {
      link: {
        text: "Some link node that should have typography applied",
        to: TestAppRoutes.PageOne,
        typography: { type: "Display", size: "Medium" } as const,
      },
    };
    const textNode = {
      text: "Some text node that should have typography applied",
      typography: { type: "Label", size: "Small" } as const,
    };

    const nodes = setReactNodesTypography([stringNode, linkNode, textNode], {
      link: { type: "Body", size: "Large" },
    });

    expect(nodes).toEqual([
      stringNode,
      {
        link: {
          ...linkNode.link,
          typography: { type: "Body", size: "Large" },
        },
      },
      {
        ...textNode,
        typography: { type: "Label", size: "Small" },
      },
    ]);
  });

  it("setDefaultReactNodesTypography should change the typography of nodes except nodes with existing typography (when replaceExistingTypography is false)", () => {
    const stringNode =
      "Some string that should have default typography applied";
    const linkNode = {
      link: {
        text: "Some link node that should have default typography applied",
        to: TestAppRoutes.PageOne,
      },
    };
    const textNode = {
      text: "Some text node that should keep existing typography",
      typography: { type: "Label", size: "Small" },
    } as const;

    const defaultTypography = {
      type: "Body",
      size: "Large",
    } as const;
    const nodes = setDefaultReactNodesTypography(
      [stringNode, linkNode, textNode],
      {
        link: defaultTypography,
        text: defaultTypography,
      },
    );

    expect(nodes).toEqual([
      {
        text: stringNode,
        typography: defaultTypography,
      },
      {
        link: {
          ...linkNode.link,
          typography: defaultTypography,
        },
      },
      {
        ...textNode,
        typography: { type: "Label", size: "Small" },
      },
    ]);
  });
});
