import p from "react";
import n from "react";
var s = ({
  children: r,
  size: e = 24,
  ariaLabel: t,
  color: a,
  ariaHidden: o = !0,
  style: l,
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
      style: { color: a, ...l },
    },
    t && !o && n.createElement("title", null, t),
    r,
  );
var c = (r) =>
    p.createElement(
      s,
      { ...r, ariaLabel: "cross-medium, crossed medium, close" },
      p.createElement("path", {
        d: "M6.25 6.25L17.75 17.75M17.75 6.25L6.25 17.75",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
      }),
    ),
  f = c;
export { c as IconCrossMedium, f as default };
