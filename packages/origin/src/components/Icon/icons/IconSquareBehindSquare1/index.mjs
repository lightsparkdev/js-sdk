import p from "react";
import n from "react";
var a = ({
  children: r,
  size: e = 24,
  ariaLabel: t,
  color: s,
  ariaHidden: o = !0,
  style: l,
  ...i
}) =>
  n.createElement(
    "svg",
    {
      ...i,
      "aria-hidden": o,
      role: o ? void 0 : "img",
      width: typeof e == "number" ? `${e}px` : e,
      height: typeof e == "number" ? `${e}px` : e,
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      style: { color: s, ...l },
    },
    t && !o && n.createElement("title", null, t),
    r,
  );
var C = (r) =>
    p.createElement(
      a,
      { ...r, ariaLabel: "square-behind-square-1, copy 1, layers, pages" },
      p.createElement("path", {
        d: "M15.25 8.75V5C15.25 3.75736 14.2426 2.75 13 2.75H5C3.75736 2.75 2.75 3.75736 2.75 5V13C2.75 14.2426 3.75736 15.25 5 15.25H8.75M11 8.75H19C20.2426 8.75 21.25 9.75736 21.25 11V19C21.25 20.2426 20.2426 21.25 19 21.25H11C9.75736 21.25 8.75 20.2426 8.75 19V11C8.75 9.75736 9.75736 8.75 11 8.75Z",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
    ),
  f = C;
export { C as IconSquareBehindSquare1, f as default };
