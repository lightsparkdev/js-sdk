export type PathStrokeWidth = undefined | string;
/* "butt" is default when undefined https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-linecap */
export type PathLinecap = undefined | "butt" | "round" | "square";
/* "miter" is default when undefined https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-linejoin */
export type PathLinejoin = undefined | "miter" | "round";

export type PathProps = {
  strokeWidth?: PathStrokeWidth;
  strokeLinecap?: PathLinecap;
  strokeLinejoin?: PathLinejoin;
  fill?: string;
};
