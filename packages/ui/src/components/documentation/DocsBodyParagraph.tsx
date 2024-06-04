"use client";

import { type PartialBy } from "@lightsparkdev/core";
import { type ComponentProps } from "react";
import { StyledBody } from "../typography/Body.js";

/* NOTE: Should only be used in documentation sites where we can't currently control 
   the MDX to ReactNode rendering. Instead we allow these components to render any
   children. */

type DocsBodyParagraphProps = PartialBy<
  ComponentProps<typeof StyledBody>,
  "size" | "block"
>;

export function DocsBodyParagraph({
  size = "Medium",
  ...rest
}: DocsBodyParagraphProps) {
  return <StyledBody {...rest} size={size} block as="div" />;
}
