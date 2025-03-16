import { Toasts } from "@lightsparkdev/ui/components";
import { screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { render } from "./render";

describe("Toasts", () => {
  test("should properly infer argument types and raise errors for invalid values", async () => {
    render(
      <BrowserRouter>
        <Toasts
          queue={[
            {
              content: [
                {
                  text: "Test toast text",
                  typography: {
                    type: "Body",
                    /* @ts-expect-error `cosdlor` is not a valid prop for Body component */
                    cosdlor: "white",
                  },
                },
                {
                  link: {
                    text: "Test toast link",
                    /* @ts-expect-error `/examplsdfe` is not a valid TestAppRoute */
                    to: "/examplsdfe",
                    typography: {
                      type: "Body",
                      color: "white",
                    },
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
      expect(screen.getByText("Test toast text")).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText("Test toast link")).toBeInTheDocument();
    });
  });
});
