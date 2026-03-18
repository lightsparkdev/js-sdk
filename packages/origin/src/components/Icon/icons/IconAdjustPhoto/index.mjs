import r from "react";
import s from "react";
var p = ({
  children: t,
  size: o = 24,
  ariaLabel: n,
  color: d,
  ariaHidden: e = !0,
  style: i,
  ...a
}) =>
  s.createElement(
    "svg",
    {
      ...a,
      "aria-hidden": e,
      role: e ? void 0 : "img",
      width: typeof o == "number" ? `${o}px` : o,
      height: typeof o == "number" ? `${o}px` : o,
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      style: { color: d, ...i },
    },
    n && !e && s.createElement("title", null, n),
    t,
  );
var u = (t) =>
    r.createElement(
      p,
      { ...t, ariaLabel: "adjust-photo, tuning, settings" },
      r.createElement("path", {
        d: "M19.25 12C19.25 16.0041 16.0041 19.25 12 19.25C7.99594 19.25 4.75 16.0041 4.75 12C4.75 7.99594 7.99594 4.75 12 4.75C16.0041 4.75 19.25 7.99594 19.25 12Z",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
      r.createElement("path", {
        d: "M7.5 16.5L12 12",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
      r.createElement("path", {
        d: "M12 1.1001V1.1101",
        stroke: "currentColor",
        strokeWidth: "2.2",
        strokeLinecap: "round",
      }),
      r.createElement("path", {
        d: "M1.10156 12V12.01",
        stroke: "currentColor",
        strokeWidth: "2.2",
        strokeLinecap: "round",
      }),
      r.createElement("path", {
        d: "M22.8984 12V12.01",
        stroke: "currentColor",
        strokeWidth: "2.2",
        strokeLinecap: "round",
      }),
      r.createElement("path", {
        d: "M19.6992 4.30005V4.31005M19.6992 4.30005V4.31005",
        stroke: "currentColor",
        strokeWidth: "2.2",
        strokeLinecap: "round",
      }),
      r.createElement("path", {
        d: "M4.30078 4.30005V4.31005",
        stroke: "currentColor",
        strokeWidth: "2.2",
        strokeLinecap: "round",
      }),
      r.createElement("path", {
        d: "M19.6992 19.7V19.71M19.6992 19.7V19.71",
        stroke: "currentColor",
        strokeWidth: "2.2",
        strokeLinecap: "round",
      }),
      r.createElement("path", {
        d: "M4.30078 19.7V19.71",
        stroke: "currentColor",
        strokeWidth: "2.2",
        strokeLinecap: "round",
      }),
    ),
  c = u;
export { u as IconAdjustPhoto, c as default };
