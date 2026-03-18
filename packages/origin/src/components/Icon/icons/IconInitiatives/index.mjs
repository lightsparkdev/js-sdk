import e from "react";
import s from "react";
var i = ({
  children: t,
  size: r = 24,
  ariaLabel: n,
  color: a,
  ariaHidden: o = !0,
  style: p,
  ...l
}) =>
  s.createElement(
    "svg",
    {
      ...l,
      "aria-hidden": o,
      role: o ? void 0 : "img",
      width: typeof r == "number" ? `${r}px` : r,
      height: typeof r == "number" ? `${r}px` : r,
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      style: { color: a, ...p },
    },
    n && !o && s.createElement("title", null, n),
    t,
  );
var C = (t) =>
    e.createElement(
      i,
      { ...t, ariaLabel: "initiatives, nav, rooting" },
      e.createElement("path", {
        d: "M3.26389 15.0479C2.93096 14.0935 2.75 13.0679 2.75 12C2.75 6.89137 6.89137 2.75 12 2.75C17.1086 2.75 21.25 6.89137 21.25 12C21.25 13.0679 21.069 14.0935 20.7361 15.0479",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
      e.createElement("path", {
        d: "M7.10628 18.5379L11.1225 11.1233C11.5007 10.425 12.5028 10.425 12.8811 11.1233L16.8973 18.5379C17.3713 19.4129 16.4156 20.3678 15.541 19.8931L12.4788 18.2311C12.1813 18.0697 11.8223 18.0697 11.5248 18.2311L8.46259 19.8931C7.58805 20.3677 6.63236 19.4129 7.10628 18.5379Z",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
    ),
  f = C;
export { C as IconInitiatives, f as default };
