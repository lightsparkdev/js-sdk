"use client";

import styled from "@emotion/styled";
import { type PartialBy } from "@lightsparkdev/core";
import { type ComponentProps } from "react";
import { StyledBody } from "../typography/Body.js";

/* NOTE: Should only be used in documentation sites where we can't currently control 
   the MDX to ReactNode rendering. Instead we allow these components to render any
   children. */

type DocsBodyParagraphProps = PartialBy<
  ComponentProps<typeof StyledBody>,
  "size"
>;

export function DocsBodyParagraph({
  size = "Medium",
  ...rest
}: DocsBodyParagraphProps) {
  return (
    <StyledBodyBlock>
      <StyledBody {...rest} size={size} />
    </StyledBodyBlock>
  );
}

/** Images rendered by the markdown renderer are wrapped in a paragraph tag,
 * so we should wrap all Body tags in a paragraph tag to ensure images are display: block. */
const StyledBodyBlock = styled.div``;
