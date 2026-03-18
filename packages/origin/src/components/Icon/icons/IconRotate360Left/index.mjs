import o from "react";
import p from "react";
var a = ({
  children: r,
  size: t = 24,
  ariaLabel: n,
  color: s,
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
      width: typeof t == "number" ? `${t}px` : t,
      height: typeof t == "number" ? `${t}px` : t,
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      style: { color: s, ...l },
    },
    n && !e && p.createElement("title", null, n),
    r,
  );
var C = (r) =>
    o.createElement(
      a,
      { ...r, ariaLabel: "rotate-360-left" },
      o.createElement("path", {
        d: "M13.5 13.5L10.75 16.25L13.5 19",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
      o.createElement("path", {
        d: "M11 16.25H12C17.6609 16.25 22.25 13.8995 22.25 11C22.25 8.10051 17.6609 5.75 12 5.75C6.33908 5.75 1.75 8.10051 1.75 11C1.75 12.8075 3.5333 14.4016 6.24789 15.346",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
      }),
    ),
  f = C;
export { C as IconRotate360Left, f as default };
