import e from "react";
import s from "react";
var i = ({
  children: o,
  size: r = 24,
  ariaLabel: n,
  color: p,
  ariaHidden: t = !0,
  style: l,
  ...a
}) =>
  s.createElement(
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
      style: { color: p, ...l },
    },
    n && !t && s.createElement("title", null, n),
    o,
  );
var c = (o) =>
    e.createElement(
      i,
      { ...o, ariaLabel: "time-flies, speed" },
      e.createElement("circle", {
        cx: "15",
        cy: "12",
        r: "7.25",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
      e.createElement("path", {
        d: "M1.75 12H4.25M2.75 16.25H5.25M2.75 7.75H5.25",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
      e.createElement("path", {
        d: "M15 8.75V12L17 14",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
    ),
  C = c;
export { c as IconTimeFlies, C as default };
