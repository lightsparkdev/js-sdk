import l from "react";
import n from "react";
var s = ({
  children: r,
  size: e = 24,
  ariaLabel: t,
  color: a,
  ariaHidden: o = !0,
  style: p,
  ...m
}) =>
  n.createElement(
    "svg",
    {
      ...m,
      "aria-hidden": o,
      role: o ? void 0 : "img",
      width: typeof e == "number" ? `${e}px` : e,
      height: typeof e == "number" ? `${e}px` : e,
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      style: { color: a, ...p },
    },
    t && !o && n.createElement("title", null, t),
    r,
  );
var c = (r) =>
    l.createElement(
      s,
      { ...r, ariaLabel: "cross-small, crossed small, delete, remove" },
      l.createElement("path", {
        d: "M7.75 7.75L16.25 16.25M16.25 7.75L7.75 16.25",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
      }),
    ),
  f = c;
export { c as IconCrossSmall, f as default };
