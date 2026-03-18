import a from "react";
import n from "react";
var p = ({
  children: t,
  size: r = 24,
  ariaLabel: o,
  color: s,
  ariaHidden: e = !0,
  style: l,
  ...i
}) =>
  n.createElement(
    "svg",
    {
      ...i,
      "aria-hidden": e,
      role: e ? void 0 : "img",
      width: typeof r == "number" ? `${r}px` : r,
      height: typeof r == "number" ? `${r}px` : r,
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      style: { color: s, ...l },
    },
    o && !e && n.createElement("title", null, o),
    t,
  );
var m = (t) =>
    a.createElement(
      p,
      { ...t, ariaLabel: "arrow-up-right" },
      a.createElement("path", {
        d: "M18.25 15.25V5.75M18.25 5.75H8.75M18.25 5.75L6 18",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
    ),
  f = m;
export { m as IconArrowUpRight, f as default };
