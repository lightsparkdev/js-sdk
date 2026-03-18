import e from "react";
import l from "react";
var p = ({
  children: o,
  size: r = 24,
  ariaLabel: n,
  color: i,
  ariaHidden: t = !0,
  style: s,
  ...a
}) =>
  l.createElement(
    "svg",
    {
      ...a,
      "aria-hidden": t,
      role: t ? void 0 : "img",
      width: typeof r == "number" ? `${r}px` : r,
      height: typeof r == "number" ? `${r}px` : r,
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      style: { color: i, ...s },
    },
    n && !t && l.createElement("title", null, n),
    o,
  );
var C = (o) =>
    e.createElement(
      p,
      { ...o, ariaLabel: "circle-info, info circle, tooltip, information" },
      e.createElement("path", {
        d: "M10.75 11H12L12 16.25M21.25 12C21.25 17.1086 17.1086 21.25 12 21.25C6.89137 21.25 2.75 17.1086 2.75 12C2.75 6.89137 6.89137 2.75 12 2.75C17.1086 2.75 21.25 6.89137 21.25 12Z",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
      e.createElement("path", {
        d: "M12 7.375C11.6548 7.375 11.375 7.65482 11.375 8C11.375 8.34518 11.6548 8.625 12 8.625C12.3452 8.625 12.625 8.34518 12.625 8C12.625 7.65482 12.3452 7.375 12 7.375Z",
        fill: "currentColor",
        stroke: "currentColor",
        strokeWidth: "0.25",
      }),
    ),
  d = C;
export { C as IconCircleInfo, d as default };
