import p from "react";
import n from "react";
var a = ({
  children: e,
  size: r = 24,
  ariaLabel: o,
  color: l,
  ariaHidden: t = !0,
  style: s,
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
      style: { color: l, ...s },
    },
    o && !t && n.createElement("title", null, o),
    e,
  );
var m = (e) =>
    p.createElement(
      a,
      { ...e, ariaLabel: "chevron-right-small" },
      p.createElement("path", {
        d: "M10 16L14 12L10 8",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
    ),
  g = m;
export { m as IconChevronRightSmall, g as default };
