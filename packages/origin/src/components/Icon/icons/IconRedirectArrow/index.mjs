import t from "react";
import p from "react";
var s = ({
  children: e,
  size: r = 24,
  ariaLabel: n,
  color: a,
  ariaHidden: o = !0,
  style: i,
  ...l
}) =>
  p.createElement(
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
      style: { color: a, ...i },
    },
    n && !o && p.createElement("title", null, n),
    e,
  );
var c = (e) =>
    t.createElement(
      s,
      { ...e, ariaLabel: "redirect-arrow" },
      t.createElement("path", {
        d: "M12 20.25V7.875C12 5.59683 10.1532 3.75 7.875 3.75C5.59683 3.75 3.75 5.59683 3.75 7.875C3.75 10.1532 5.59683 12 7.875 12H20",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
      t.createElement("path", {
        d: "M16.75 8.5L20.25 12L16.75 15.5",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
    ),
  f = c;
export { c as IconRedirectArrow, f as default };
