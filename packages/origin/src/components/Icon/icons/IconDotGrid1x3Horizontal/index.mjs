import r from "react";
import C from "react";
var l = ({
  children: t,
  size: o = 24,
  ariaLabel: n,
  color: p,
  ariaHidden: e = !0,
  style: i,
  ...s
}) =>
  C.createElement(
    "svg",
    {
      ...s,
      "aria-hidden": e,
      role: e ? void 0 : "img",
      width: typeof o == "number" ? `${o}px` : o,
      height: typeof o == "number" ? `${o}px` : o,
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      style: { color: p, ...i },
    },
    n && !e && C.createElement("title", null, n),
    t,
  );
var a = (t) =>
    r.createElement(
      l,
      { ...t, ariaLabel: "dot-grid-1x3-horizontal, menu, drag, grab" },
      r.createElement("path", {
        d: "M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z",
        fill: "currentColor",
      }),
      r.createElement("path", {
        d: "M20.25 13C20.8023 13 21.25 12.5523 21.25 12C21.25 11.4477 20.8023 11 20.25 11C19.6977 11 19.25 11.4477 19.25 12C19.25 12.5523 19.6977 13 20.25 13Z",
        fill: "currentColor",
      }),
      r.createElement("path", {
        d: "M3.75 13C4.30228 13 4.75 12.5523 4.75 12C4.75 11.4477 4.30228 11 3.75 11C3.19772 11 2.75 11.4477 2.75 12C2.75 12.5523 3.19772 13 3.75 13Z",
        fill: "currentColor",
      }),
      r.createElement("path", {
        d: "M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
      r.createElement("path", {
        d: "M20.25 13C20.8023 13 21.25 12.5523 21.25 12C21.25 11.4477 20.8023 11 20.25 11C19.6977 11 19.25 11.4477 19.25 12C19.25 12.5523 19.6977 13 20.25 13Z",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
      r.createElement("path", {
        d: "M3.75 13C4.30228 13 4.75 12.5523 4.75 12C4.75 11.4477 4.30228 11 3.75 11C3.19772 11 2.75 11.4477 2.75 12C2.75 12.5523 3.19772 13 3.75 13Z",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
    ),
  m = a;
export { a as IconDotGrid1x3Horizontal, m as default };
