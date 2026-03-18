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
      { ...e, ariaLabel: "bars-three-2, menu, list, hamburger" },
      s.createElement("path", {
        d: "M2.75 12H21.25M2.75 5.75H21.25M2.75 18.25H11.5",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
    ),
  f = m;
export { m as IconBarsThree2, f as default };
