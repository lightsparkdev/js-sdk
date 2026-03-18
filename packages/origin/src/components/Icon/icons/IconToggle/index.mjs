import o from "react";
import l from "react";
var p = ({
  children: t,
  size: r = 24,
  ariaLabel: n,
  color: s,
  ariaHidden: e = !0,
  style: a,
  ...c
}) =>
  l.createElement(
    "svg",
    {
      ...c,
      "aria-hidden": e,
      role: e ? void 0 : "img",
      width: typeof r == "number" ? `${r}px` : r,
      height: typeof r == "number" ? `${r}px` : r,
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      style: { color: s, ...a },
    },
    n && !e && l.createElement("title", null, n),
    t,
  );
var i = (t) =>
    o.createElement(
      p,
      { ...t, ariaLabel: "toggle, settings, control" },
      o.createElement("rect", {
        x: "1.25",
        y: "4.75",
        width: "21.5",
        height: "14.5",
        rx: "7.25",
        stroke: "currentColor",
        strokeWidth: "1.5",
      }),
      o.createElement("circle", {
        cx: "8.5",
        cy: "12",
        r: "3",
        fill: "currentColor",
      }),
    ),
  f = i;
export { i as IconToggle, f as default };
