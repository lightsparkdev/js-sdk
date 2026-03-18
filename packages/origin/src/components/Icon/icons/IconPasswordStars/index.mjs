import o from "react";
import s from "react";
var p = ({
  children: t,
  size: r = 24,
  ariaLabel: n,
  color: a,
  ariaHidden: e = !0,
  style: l,
  ...i
}) =>
  s.createElement(
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
      style: { color: a, ...l },
    },
    n && !e && s.createElement("title", null, n),
    t,
  );
var d = (t) =>
    o.createElement(
      p,
      { ...t, ariaLabel: "password-stars" },
      o.createElement("path", {
        d: "M1.75 17.25L22.25 17.25",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
      }),
      o.createElement("path", {
        d: "M9.75 9.94856H14.25M13.125 11.8971L10.875 8M10.875 11.8972L13.125 8.00005",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
      }),
      o.createElement("path", {
        d: "M17.75 9.94856H22.25M21.125 11.8971L18.875 8M18.875 11.8972L21.125 8.00005",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
      }),
      o.createElement("path", {
        d: "M1.80078 9.94856H6.30078M5.17578 11.8971L2.92578 8M2.92578 11.8972L5.17578 8.00005",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
      }),
    ),
  C = d;
export { d as IconPasswordStars, C as default };
