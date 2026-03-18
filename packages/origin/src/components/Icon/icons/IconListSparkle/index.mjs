import p from "react";
import n from "react";
var a = ({
  children: t,
  size: e = 24,
  ariaLabel: o,
  color: s,
  ariaHidden: r = !0,
  style: l,
  ...i
}) =>
  n.createElement(
    "svg",
    {
      ...i,
      "aria-hidden": r,
      role: r ? void 0 : "img",
      width: typeof e == "number" ? `${e}px` : e,
      height: typeof e == "number" ? `${e}px` : e,
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      style: { color: s, ...l },
    },
    o && !r && n.createElement("title", null, o),
    t,
  );
var m = (t) =>
    p.createElement(
      a,
      { ...t, ariaLabel: "list-sparkle, ai text, text generation" },
      p.createElement("path", {
        d: "M3.75 18.25H7.25M3.75 12H9.25M3.75 5.75H20.25M17 10.5L18.5 13.5L21.5 15L18.5 16.5L17 19.5L15.5 16.5L12.5 15L15.5 13.5L17 10.5Z",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
    ),
  C = m;
export { m as IconListSparkle, C as default };
