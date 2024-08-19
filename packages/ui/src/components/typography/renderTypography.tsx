import React, { type ComponentProps, type ElementType } from "react";
import { type TypographyTypeKey } from "../../styles/tokens/typography.js";
import { Body } from "./Body.js";
import { BodyStrong } from "./BodyStrong.js";
import { Code } from "./Code.js";
import { Display } from "./Display.js";
import { Headline } from "./Headline.js";
import { Label } from "./Label.js";
import { LabelModerate } from "./LabelModerate.js";
import { LabelStrong } from "./LabelStrong.js";
import { Overline } from "./Overline.js";
import { Title } from "./Title.js";

export const typographyMap = {
  Display: Display,
  Headline: Headline,
  Title: Title,
  Body: Body,
  "Body Strong": BodyStrong,
  Label: Label,
  "Label Moderate": LabelModerate,
  "Label Strong": LabelStrong,
  Overline: Overline,
  Code: Code,
  "Code Strong": Code,
} as const;

export type RenderTypographyArgs<T extends TypographyTypeKey> = {
  type: T;
  props: ComponentProps<(typeof typographyMap)[T]>;
};

export const renderTypography = <T extends TypographyTypeKey>(
  type: T,
  props: ComponentProps<(typeof typographyMap)[T]>,
) => {
  /** props type is too wide, causing issues with overlapping different props types (e.g. `tag`), so
   * we have to cast this to a generic ElementType to pass createElement types. We still have type
   * saftey for specific component prop types via renderTypography args. */
  const TypographyComponent = typographyMap[type] as ElementType;
  const { children, ...rest } = props;
  return React.createElement(TypographyComponent, rest, children);
};
