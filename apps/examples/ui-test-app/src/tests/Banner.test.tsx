import { ThemeProvider } from "@emotion/react";
import { Banner } from "@lightsparkdev/ui/components";
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

describe("Banner", () => {
  test("should properly infer argument types and raise errors for invalid values", () => {
    render(
      <BrowserRouter>
        <Banner
          content={[
            "Hello",
            /* @ts-expect-error `/exasdmple` is not a valid TestAppRoute */
            { text: "World", to: "/exasdmple" },
            { text: "!" },
            { text: "!", to: TestAppRoutes.PageOne },
            { text: "sdkfjn", externalLink: "https://example.com" },
          ]}
          color="blue43"
          stepDuration={5}
          offsetTop={0}
          image={{ src: "https://example.com/image.jpg" }}
        />
      </BrowserRouter>,
    );
  });
});
