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
