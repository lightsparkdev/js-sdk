import { ThemeProvider } from "@emotion/react";
import { Toasts } from "@lightsparkdev/ui/components";
import { themes } from "@lightsparkdev/ui/styles/themes";
import { screen, render as tlRender, waitFor } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { BrowserRouter } from "react-router-dom";

function Providers({ children }: { children: ReactNode }) {
  return <ThemeProvider theme={themes.dark}>{children}</ThemeProvider>;
}

function render(renderElement: ReactElement) {
  return tlRender(renderElement, {
    wrapper: Providers,
  });
}

describe("Toasts", () => {
  test("should properly infer argument types and raise errors for invalid values", async () => {
    render(
      <BrowserRouter>
        <Toasts
          queue={[
            {
              text: [
                {
                  text: "Test toast",
                  typography: {
                    type: "Body",
                    /* @ts-expect-error `cosdlor` is not a valid prop for Body component */
                    cosdlor: "white",
                  },
                },
                {
                  text: "Test toast",
                  /* @ts-expect-error `/examplsdfe` is not a valid TestAppRoute */
                  to: "/examplsdfe",
                  typography: {
                    type: "Body",
                    color: "white",
                  },
                },
              ],
              duration: 5000,
              id: "test-toast",
              expires: Date.now() + 5000,
            },
          ]}
          onHide={() => {}}
        />
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("Test toast")).toBeInTheDocument();
    });
  });
});
