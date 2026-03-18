import o from "react";
import p from "react";
var s = ({
  children: e,
  size: r = 24,
  ariaLabel: n,
  color: a,
  ariaHidden: t = !0,
  style: l,
  ...i
}) =>
  p.createElement(
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
      style: { color: a, ...l },
    },
    n && !t && p.createElement("title", null, n),
    e,
  );
var u = (e) =>
    o.createElement(
      s,
      { ...e, ariaLabel: "arrow-up-wall" },
      o.createElement("path", {
        d: "M16.5 8.25L12 3.75L7.5 8.25",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
      o.createElement("path", {
        d: "M19.25 20.25L4.75 20.25",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
      o.createElement("path", {
        d: "M12 4.5V16.25",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
    ),
  C = u;
export { u as IconArrowUpWall, C as default };
