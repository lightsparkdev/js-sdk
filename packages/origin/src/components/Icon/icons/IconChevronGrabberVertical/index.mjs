import t from "react";
import a from "react";
var p = ({
  children: e,
  size: r = 24,
  ariaLabel: n,
  color: s,
  ariaHidden: o = !0,
  style: l,
  ...i
}) =>
  a.createElement(
    "svg",
    {
      ...i,
      "aria-hidden": o,
      role: o ? void 0 : "img",
      width: typeof r == "number" ? `${r}px` : r,
      height: typeof r == "number" ? `${r}px` : r,
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      style: { color: s, ...l },
    },
    n && !o && a.createElement("title", null, n),
    e,
  );
var c = (e) =>
    t.createElement(
      p,
      { ...e, ariaLabel: "chevron-grabber-vertical" },
      t.createElement("path", {
        d: "M8 9L12 5L16 9",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
      t.createElement("path", {
        d: "M16 15L12 19L8 15",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
    ),
  h = c;
export { c as IconChevronGrabberVertical, h as default };
