import { renderTypography } from "@lightsparkdev/ui/components/typography/renderTypography";

describe("renderTypography", () => {
  test("should properly infer argument types and raise errors for invalid values", () => {
    /* @ts-expect-error `hey` is not a valid prop for Display component */
    renderTypography("Display", { hey: "hey" });
    renderTypography("Display", { content: "hey" });
  });

  test("should properly infer argument types and raise errors for invalid tags", () => {
    /* @ts-expect-error `span` is not a valid tag for Display component */
    renderTypography("Display", { tag: "span" });
    renderTypography("Display", { tag: "h1" });

    /* @ts-expect-error `h1` is not a valid tag for Body component */
    renderTypography("Body", { tag: "h1" });
    renderTypography("Body", { tag: "span" });
  });
});
