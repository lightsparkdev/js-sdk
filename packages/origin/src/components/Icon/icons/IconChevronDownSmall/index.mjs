import p from "react";
import n from "react";
var a = ({
  children: e,
  size: r = 24,
  ariaLabel: t,
  color: l,
  ariaHidden: o = !0,
  style: s,
  ...m
}) =>
  n.createElement(
    "svg",
    {
      ...m,
      "aria-hidden": o,
      role: o ? void 0 : "img",
      width: typeof r == "number" ? `${r}px` : r,
      height: typeof r == "number" ? `${r}px` : r,
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      style: { color: l, ...s },
    },
    t && !o && n.createElement("title", null, t),
    e,
  );
var i = (e) =>
    p.createElement(
      a,
      { ...e, ariaLabel: "chevron-down-small" },
      p.createElement("path", {
        d: "M8 10L12 14L16 10",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
    ),
  f = i;
export { i as IconChevronDownSmall, f as default };
