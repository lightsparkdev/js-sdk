import t from "react";
import l from "react";
var i = ({
  children: e,
  size: r = 24,
  ariaLabel: n,
  color: a,
  ariaHidden: o = !0,
  style: p,
  ...s
}) =>
  l.createElement(
    "svg",
    {
      ...s,
      "aria-hidden": o,
      role: o ? void 0 : "img",
      width: typeof r == "number" ? `${r}px` : r,
      height: typeof r == "number" ? `${r}px` : r,
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      style: { color: a, ...p },
    },
    n && !o && l.createElement("title", null, n),
    e,
  );
var c = (e) =>
    t.createElement(
      i,
      { ...e, ariaLabel: "dot-grid-1x3-vertical-tight, menu, drag, grab" },
      t.createElement("rect", {
        x: "10",
        y: "3",
        width: "4",
        height: "4",
        rx: "2",
        fill: "currentColor",
      }),
      t.createElement("rect", {
        x: "10",
        y: "10",
        width: "4",
        height: "4",
        rx: "2",
        fill: "currentColor",
      }),
      t.createElement("rect", {
        x: "10",
        y: "17",
        width: "4",
        height: "4",
        rx: "2",
        fill: "currentColor",
      }),
    ),
  f = c;
export { c as IconDotGrid1x3VerticalTight, f as default };
