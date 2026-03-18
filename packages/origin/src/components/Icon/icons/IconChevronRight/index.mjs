import a from "react";
import n from "react";
var p = ({
  children: e,
  size: r = 24,
  ariaLabel: o,
  color: s,
  ariaHidden: t = !0,
  style: l,
  ...i
}) =>
  n.createElement(
    "svg",
    {
      ...i,
      "aria-hidden": t,
      role: t ? void 0 : "img",
      width: typeof r == "number" ? `${r}px` : r,
      height: typeof r == "number" ? `${r}px` : r,
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      style: { color: s, ...l },
    },
    o && !t && n.createElement("title", null, o),
    e,
  );
var c = (e) =>
    a.createElement(
      p,
      { ...e, ariaLabel: "chevron-right" },
      a.createElement("path", {
        d: "M9 4L17 12L9 20",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
    ),
  g = c;
export { c as IconChevronRight, g as default };
