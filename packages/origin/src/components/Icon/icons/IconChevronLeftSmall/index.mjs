import l from "react";
import n from "react";
var a = ({
  children: r,
  size: e = 24,
  ariaLabel: o,
  color: p,
  ariaHidden: t = !0,
  style: s,
  ...m
}) =>
  n.createElement(
    "svg",
    {
      ...m,
      "aria-hidden": t,
      role: t ? void 0 : "img",
      width: typeof e == "number" ? `${e}px` : e,
      height: typeof e == "number" ? `${e}px` : e,
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      style: { color: p, ...s },
    },
    o && !t && n.createElement("title", null, o),
    r,
  );
var i = (r) =>
    l.createElement(
      a,
      { ...r, ariaLabel: "chevron-left-small" },
      l.createElement("path", {
        d: "M14 16L10 12L14 8",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
    ),
  h = i;
export { i as IconChevronLeftSmall, h as default };
