import p from "react";
import n from "react";
var a = ({
  children: r,
  size: e = 24,
  ariaLabel: o,
  color: s,
  ariaHidden: t = !0,
  style: l,
  ...m
}) =>
  n.createElement(
    "svg",
    {
      ...m,
      "aria-hidden": t,
      role: t ? void 0 : "img",
      width: typeof e == "number" ? `${e}px` : e,
      height: typeof e == "number" ? `${e}px` : e,
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      style: { color: s, ...l },
    },
    o && !t && n.createElement("title", null, o),
    r,
  );
var i = (r) =>
    p.createElement(
      a,
      { ...r, ariaLabel: "minus-large, remove, delete" },
      p.createElement("path", {
        d: "M3.75 12H20.25",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
      }),
    ),
  f = i;
export { i as IconMinusLarge, f as default };
