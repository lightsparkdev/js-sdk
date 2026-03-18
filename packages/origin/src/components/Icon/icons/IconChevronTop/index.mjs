import a from "react";
import n from "react";
var p = ({
  children: e,
  size: r = 24,
  ariaLabel: t,
  color: s,
  ariaHidden: o = !0,
  style: l,
  ...i
}) =>
  n.createElement(
    "svg",
    {
      ...i,
      "aria-hidden": o,
      role: o ? void 0 : "img",
      width: typeof r == "number" ? `${r}px` : r,
      height: typeof r == "number" ? `${r}px` : r,
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      style: { color: s, ...l },
    },
    t && !o && n.createElement("title", null, t),
    e,
  );
var c = (e) =>
    a.createElement(
      p,
      { ...e, ariaLabel: "chevron-top" },
      a.createElement("path", {
        d: "M4 15L12 7L20 15",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
    ),
  h = c;
export { c as IconChevronTop, h as default };
