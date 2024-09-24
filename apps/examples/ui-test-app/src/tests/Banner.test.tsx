import { ThemeProvider } from "@emotion/react";
import { Banner } from "@lightsparkdev/ui/components";
import { themes } from "@lightsparkdev/ui/styles/themes";
import { link } from "@lightsparkdev/ui/utils/toReactNodes/nodes";
import { screen, render as tlRender, waitFor } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { BrowserRouter } from "react-router-dom";
import { TestAppRoutes } from "../types";

function Providers({ children }: { children: ReactNode }) {
  return <ThemeProvider theme={themes.dark}>{children}</ThemeProvider>;
}

function render(renderElement: ReactElement) {
  return tlRender(renderElement, {
    wrapper: Providers,
  });
}

describe("Banner", () => {
  test("should properly infer argument types and raise errors for invalid values", async () => {
    render(
      <BrowserRouter>
        <Banner
          content={[
            "Hello",
            {
              link: {
                text: "World",
                /* @ts-expect-error `/exasdmple` is not a valid TestAppRoute */
                to: "/exasdmple",
              },
            },
            {
              text: "!",
              typography: {
                type: "Body",
                /* @ts-expect-error `children` cannot be provided as typography prop to TextNode */
                children: "Hello",
              },
            },
            {
              text: "!",
              typography: {
                type: "Headline",
                /* @ts-expect-error `cosdlor` is not a valid prop for Headline component */
                cosdlor: "sdfsd",
              },
            },
            {
              text: "!",
              typography: {
                type: "Display",
                /* @ts-expect-error `content` cannot be provided as typography props to TextNode nodes */
                content: [{ text: "Hello" }],
              },
            },
            link({
              text: "!",
              typography: {
                type: "Body",
                color: "white",
              },
              to: TestAppRoutes.PageOne,
            }),
            {
              link: {
                text: "sdkfjn",
                externalLink: "https://example.com",
              },
            },
          ]}
          color="blue43"
          stepDuration={5}
          offsetTop={0}
          image={{ src: "https://example.com/image.jpg" }}
        />
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("Hello")).toBeInTheDocument();
    });
  });
});
