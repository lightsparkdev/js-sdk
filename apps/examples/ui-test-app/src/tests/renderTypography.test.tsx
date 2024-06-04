import { renderTypography } from "@lightsparkdev/ui/components/typography/renderTypography";

describe("TextIconAligner", () => {
  test("should properly infer argument types and raise errors for invalid values", () => {
    /* @ts-expect-error `hey` is not a valid prop for Display component */
    renderTypography("Display", { hey: "hey" });
    renderTypography("Display", { content: "hey" });
  });
});
