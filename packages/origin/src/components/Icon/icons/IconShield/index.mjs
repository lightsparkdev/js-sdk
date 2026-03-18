import s from "react";
import n from "react";
var p = ({
  children: r,
  size: e = 24,
  ariaLabel: o,
  color: a,
  ariaHidden: t = !0,
  style: l,
  ...i
}) =>
  n.createElement(
    "svg",
    {
      ...i,
      "aria-hidden": t,
      role: t ? void 0 : "img",
      width: typeof e == "number" ? `${e}px` : e,
      height: typeof e == "number" ? `${e}px` : e,
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      style: { color: a, ...l },
    },
    o && !t && n.createElement("title", null, o),
    r,
  );
var c = (r) =>
    s.createElement(
      p,
      { ...r, ariaLabel: "shield, security, protection" },
      s.createElement("path", {
        d: "M20.25 6.94153C20.25 6.08067 19.6991 5.31639 18.8825 5.04417L12.9487 3.06624C12.3329 2.86098 11.6671 2.86098 11.0513 3.06624L5.11754 5.04417C4.30086 5.31639 3.75 6.08067 3.75 6.94153V11.9124C3.75 16.8848 8 19.25 12 21.4079C16 19.25 20.25 16.8848 20.25 11.9124V6.94153Z",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "square",
        strokeLinejoin: "round",
      }),
    ),
  f = c;
export { c as IconShield, f as default };
