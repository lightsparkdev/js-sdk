import o from "react";
import p from "react";
var a = ({
  children: t,
  size: r = 24,
  ariaLabel: n,
  color: s,
  ariaHidden: e = !0,
  style: l,
  ...i
}) =>
  p.createElement(
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
    n && !e && p.createElement("title", null, n),
    t,
  );
var C = (t) =>
    o.createElement(
      a,
      { ...t, ariaLabel: "rotate-360-right" },
      o.createElement("path", {
        d: "M10.5 13.5L13.25 16.25L10.5 19",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
      o.createElement("path", {
        d: "M13 16.25H12C6.33908 16.25 1.75 13.8995 1.75 11C1.75 8.10051 6.33908 5.75 12 5.75C17.6609 5.75 22.25 8.10051 22.25 11C22.25 12.8075 20.4667 14.4016 17.7521 15.346",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
      }),
    ),
  h = C;
export { C as IconRotate360Right, h as default };
