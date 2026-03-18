import a from "react";
import n from "react";
var p = ({
  children: r,
  size: e = 24,
  ariaLabel: o,
  color: l,
  ariaHidden: t = !0,
  style: s,
  ...c
}) =>
  n.createElement(
    "svg",
    {
      ...c,
      "aria-hidden": t,
      role: t ? void 0 : "img",
      width: typeof e == "number" ? `${e}px` : e,
      height: typeof e == "number" ? `${e}px` : e,
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      style: { color: l, ...s },
    },
    o && !t && n.createElement("title", null, o),
    r,
  );
var C = (r) =>
    a.createElement(
      p,
      { ...r, ariaLabel: "paperclip-1, attachment" },
      a.createElement("path", {
        d: "M5.75 10.75V15.25C5.75 18.5637 8.43629 21.25 11.75 21.25H12.25C15.5637 21.25 18.25 18.5637 18.25 15.25V7C18.25 4.65279 16.3472 2.75 14 2.75C11.6528 2.75 9.75 4.65279 9.75 7V14.875C9.75 16.0486 10.7014 17 11.875 17C13.0486 17 14 16.0486 14 14.875V7.75",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
      }),
    ),
  g = C;
export { C as IconPaperclip1, g as default };
