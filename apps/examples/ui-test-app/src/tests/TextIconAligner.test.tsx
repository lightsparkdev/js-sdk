import { TextIconAligner } from "@lightsparkdev/ui/components";
import { link } from "@lightsparkdev/ui/utils/toReactNodes/nodes";
import { screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { TestAppRoutes } from "../types";
import { render } from "./render";

describe("TextIconAligner", () => {
  test("should properly infer argument types and raise errors for invalid values", async () => {
    render(
      <BrowserRouter>
        <TextIconAligner
          content={[
            "Hello",
            /* @ts-expect-error `/something` is not a valid TestAppRoute */
            { to: "/something", text: "World" },
            link({ text: "Page one", to: TestAppRoutes.PageOne }),
            link({ text: "Page two", to: TestAppRoutes.PageTwo }),
            /* @ts-expect-error `something` is not a valid TextNode prop */
            { text: "Page one", something: "something" },
          ]}
          typography={{
            type: "Display",
            size: "Small",
            color: "blue43",
          }}
          rightIcon={{ name: "ArrowRight" }}
        />
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("Page one")).toBeInTheDocument();
    });
  });
});
