import s from "react";
import n from "react";
var a = ({
  children: e,
  size: r = 24,
  ariaLabel: o,
  color: p,
  ariaHidden: t = !0,
  style: l,
  ...i
}) =>
  n.createElement(
    "svg",
    {
      ...i,
      "aria-hidden": t,
      role: t ? void 0 : "img",
      width: typeof r == "number" ? `${r}px` : r,
      height: typeof r == "number" ? `${r}px` : r,
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      style: { color: p, ...l },
    },
    o && !t && n.createElement("title", null, o),
    e,
  );
var m = (e) =>
    s.createElement(
      a,
      { ...e, ariaLabel: "magnifying-glass-2, search " },
      s.createElement("path", {
        d: "M20 20L16.1265 16.1265M16.1265 16.1265C17.4385 14.8145 18.25 13.002 18.25 11C18.25 6.99594 15.0041 3.75 11 3.75C6.99594 3.75 3.75 6.99594 3.75 11C3.75 15.0041 6.99594 18.25 11 18.25C13.002 18.25 14.8145 17.4385 16.1265 16.1265Z",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
    ),
  u = m;
export { m as IconMagnifyingGlass2, u as default };
