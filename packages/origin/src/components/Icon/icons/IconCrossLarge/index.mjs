import a from "react";
import n from "react";
var s = ({
  children: e,
  size: r = 24,
  ariaLabel: t,
  color: p,
  ariaHidden: o = !0,
  style: l,
  ...c
}) =>
  n.createElement(
    "svg",
    {
      ...c,
      "aria-hidden": o,
      role: o ? void 0 : "img",
      width: typeof r == "number" ? `${r}px` : r,
      height: typeof r == "number" ? `${r}px` : r,
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      style: { color: p, ...l },
    },
    t && !o && n.createElement("title", null, t),
    e,
  );
var m = (e) =>
    a.createElement(
      s,
      { ...e, ariaLabel: "cross-large, crossed large, close" },
      a.createElement("path", {
        d: "M4.75 4.75L19.25 19.25M19.25 4.75L4.75 19.25",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
      }),
    ),
  f = m;
export { m as IconCrossLarge, f as default };
