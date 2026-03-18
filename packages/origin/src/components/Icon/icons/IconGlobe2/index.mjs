import t from "react";
import l from "react";
var s = ({
  children: e,
  size: r = 24,
  ariaLabel: n,
  color: p,
  ariaHidden: o = !0,
  style: a,
  ...c
}) =>
  l.createElement(
    "svg",
    {
      ...c,
      "aria-hidden": o,
      role: o ? void 0 : "img",
      width: typeof r == "number" ? `${r}px` : r,
      height: typeof r == "number" ? `${r}px` : r,
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      style: { color: p, ...a },
    },
    n && !o && l.createElement("title", null, n),
    e,
  );
var i = (e) =>
    t.createElement(
      s,
      { ...e, ariaLabel: "globe-2, network, translate" },
      t.createElement("circle", {
        cx: "12",
        cy: "12",
        r: "9.25",
        stroke: "currentColor",
        strokeWidth: "1.5",
      }),
      t.createElement("ellipse", {
        cx: "12",
        cy: "12",
        rx: "3.5",
        ry: "9.25",
        stroke: "currentColor",
        strokeWidth: "1.5",
      }),
      t.createElement("path", {
        d: "M3.5 9.25H20.5",
        stroke: "currentColor",
        strokeWidth: "1.5",
      }),
      t.createElement("path", {
        d: "M3.5 14.75H20.5",
        stroke: "currentColor",
        strokeWidth: "1.5",
      }),
    ),
  x = i;
export { i as IconGlobe2, x as default };
