import a from "react";
import n from "react";
var p = ({
  children: r,
  size: o = 24,
  ariaLabel: e,
  color: s,
  ariaHidden: t = !0,
  style: l,
  ...m
}) =>
  n.createElement(
    "svg",
    {
      ...m,
      "aria-hidden": t,
      role: t ? void 0 : "img",
      width: typeof o == "number" ? `${o}px` : o,
      height: typeof o == "number" ? `${o}px` : o,
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      style: { color: s, ...l },
    },
    e && !t && n.createElement("title", null, e),
    r,
  );
var i = (r) =>
    a.createElement(
      p,
      { ...r, ariaLabel: "chevron-bottom" },
      a.createElement("path", {
        d: "M20 9L12 17L4 9",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
    ),
  h = i;
export { i as IconChevronBottom, h as default };
