import { ThemeProvider } from "@emotion/react";
import { TextIconAligner } from "@lightsparkdev/ui/components";
import { themes } from "@lightsparkdev/ui/styles/themes";
import { render as tlRender } from "@testing-library/react";
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

describe("TextIconAligner", () => {
  test("should properly infer argument types and raise errors for invalid values", () => {
    render(
      <BrowserRouter>
        <TextIconAligner
          content={[
            "Hello",
            /* @ts-expect-error `/something` is not a valid TestAppRoute */
            { to: "/something", text: "World" },
            { text: "Page one", to: TestAppRoutes.PageOne },
            { text: "Page one", to: TestAppRoutes.PageOne },
            { text: "Page one", to: TestAppRoutes.PageOne },
            { text: "sdkfjn", externalLink: "https://example.com" },
          ]}
          typography={{
            type: "Display",
            size: "Small",
            color: "blue43",
          }}
          rightIcon={{ name: "RightArrow" }}
        />
      </BrowserRouter>,
    );
  });
});
