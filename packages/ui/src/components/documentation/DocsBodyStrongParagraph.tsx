"use client";

import styled from "@emotion/styled";
import { type PartialBy } from "@lightsparkdev/core";
import { type ComponentProps } from "react";
import { StyledBodyStrong } from "../typography/base/BodyStrong.js";

/* NOTE: Should only be used in documentation sites where we can't currently control 
   the MDX to ReactNode rendering. Instead we allow these components to render any
   children. */

type DocsBodyStrongParagraphProps = PartialBy<
  ComponentProps<typeof StyledBodyStrong>,
  "size" | "block" | "colorProp" | "displayProp" | "hideOverflow"
>;

export function DocsBodyStrongParagraph({
  block = false,
  colorProp,
  displayProp,
  hideOverflow = false,
  size = "Medium",
  ...rest
}: DocsBodyStrongParagraphProps) {
  return (
    <StyledBodyStrongBlock>
      <StyledBodyStrong
        {...rest}
        block={block}
        colorProp={colorProp}
        displayProp={displayProp}
        hideOverflow={hideOverflow}
        size={size}
      />
    </StyledBodyStrongBlock>
  );
}

/** Images rendered by the markdown renderer are wrapped in a paragraph tag,
 * so we should wrap all Body tags in a paragraph tag to ensure images are display: block. */
const StyledBodyStrongBlock = styled.p``;
