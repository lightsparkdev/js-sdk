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
      { ...t, ariaLabel: "dot-grid-1x3-vertical, menu, drag, grab" },
      r.createElement("path", {
        d: "M12 4.75C12.5523 4.75 13 4.30228 13 3.75C13 3.19772 12.5523 2.75 12 2.75C11.4477 2.75 11 3.19772 11 3.75C11 4.30228 11.4477 4.75 12 4.75Z",
        fill: "currentColor",
      }),
      r.createElement("path", {
        d: "M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z",
        fill: "currentColor",
      }),
      r.createElement("path", {
        d: "M12 21.25C12.5523 21.25 13 20.8023 13 20.25C13 19.6977 12.5523 19.25 12 19.25C11.4477 19.25 11 19.6977 11 20.25C11 20.8023 11.4477 21.25 12 21.25Z",
        fill: "currentColor",
      }),
      r.createElement("path", {
        d: "M12 4.75C12.5523 4.75 13 4.30228 13 3.75C13 3.19772 12.5523 2.75 12 2.75C11.4477 2.75 11 3.19772 11 3.75C11 4.30228 11.4477 4.75 12 4.75Z",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
      r.createElement("path", {
        d: "M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
      r.createElement("path", {
        d: "M12 21.25C12.5523 21.25 13 20.8023 13 20.25C13 19.6977 12.5523 19.25 12 19.25C11.4477 19.25 11 19.6977 11 20.25C11 20.8023 11.4477 21.25 12 21.25Z",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
    ),
  h = a;
export { a as IconDotGrid1x3Vertical, h as default };
