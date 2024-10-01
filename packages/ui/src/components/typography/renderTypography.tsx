import React, { type ComponentProps, type ElementType } from "react";
import { type TypographyTypeKey } from "../../styles/tokens/typography.js";
import { BodyString } from "./base/Body.js";
import { BodyStrongString } from "./base/BodyStrong.js";
import { CodeString } from "./base/Code.js";
import { DisplayString } from "./base/Display.js";
import { HeadlineString } from "./base/Headline.js";
import { LabelString } from "./base/Label.js";
import { LabelModerateString } from "./base/LabelModerate.js";
import { LabelStrongString } from "./base/LabelStrong.js";
import { OverlineString } from "./base/Overline.js";
import { TitleString } from "./base/Title.js";

export const typographyMap = {
  Display: DisplayString,
  Headline: HeadlineString,
  Title: TitleString,
  Body: BodyString,
  "Body Strong": BodyStrongString,
  Label: LabelString,
  "Label Moderate": LabelModerateString,
  "Label Strong": LabelStrongString,
  Overline: OverlineString,
  Code: CodeString,
  "Code Strong": CodeString,
} as const;

type TypographyMapType = typeof typographyMap;

export type RenderTypographyArgs<T extends TypographyTypeKey> = {
  type: T;
  props: ComponentProps<TypographyMapType[T]>;
};

export const renderTypography = <T extends TypographyTypeKey>(
  typographyType: T,
  typographyProps: ComponentProps<TypographyMapType[T]>,
) => {
  /** props type is too wide, causing issues with overlapping different props types (e.g. `tag`), so
   * we have to cast this to a generic ElementType to pass createElement types. We still have type
   * saftey for specific component prop types via renderTypography args. */
  const TypographyComponent = typographyMap[typographyType] as ElementType;

  const { children } = typographyProps;

  return React.createElement(TypographyComponent, typographyProps, children);
};

export type TypographyPropsWithoutChildren = {
  [K in TypographyTypeKey]: { type: K } & Omit<
    ComponentProps<(typeof typographyMap)[K]>,
    "children"
  >;
}[TypographyTypeKey];
