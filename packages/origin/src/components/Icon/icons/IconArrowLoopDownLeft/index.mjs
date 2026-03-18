import t from "react";
import p from "react";
var s = ({
  children: o,
  size: r = 24,
  ariaLabel: n,
  color: a,
  ariaHidden: e = !0,
  style: l,
  ...i
}) =>
  p.createElement(
    "svg",
    {
      ...i,
      "aria-hidden": e,
      role: e ? void 0 : "img",
      width: typeof r == "number" ? `${r}px` : r,
      height: typeof r == "number" ? `${r}px` : r,
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      style: { color: a, ...l },
    },
    n && !e && p.createElement("title", null, n),
    o,
  );
var c = (o) =>
    t.createElement(
      s,
      { ...o, ariaLabel: "arrow-loop-down-left, restore, reset" },
      t.createElement("path", {
        d: "M13 17.25C16.4518 17.25 19.25 14.4518 19.25 11V10.5C19.25 6.77208 16.2279 3.75 12.5 3.75C8.77208 3.75 5.75 6.77208 5.75 10.5V20",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
      t.createElement("path", {
        d: "M2 16.5L5.75 20.25L9.5 16.5",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
    ),
  f = c;
export { c as IconArrowLoopDownLeft, f as default };
