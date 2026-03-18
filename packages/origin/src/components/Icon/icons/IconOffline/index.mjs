import o from "react";
import l from "react";
var p = ({
  children: r,
  size: e = 24,
  ariaLabel: n,
  color: a,
  ariaHidden: t = !0,
  style: s,
  ...C
}) =>
  l.createElement(
    "svg",
    {
      ...C,
      "aria-hidden": t,
      role: t ? void 0 : "img",
      width: typeof e == "number" ? `${e}px` : e,
      height: typeof e == "number" ? `${e}px` : e,
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      style: { color: a, ...s },
    },
    n && !t && l.createElement("title", null, n),
    r,
  );
var i = (r) =>
    o.createElement(
      p,
      { ...r, ariaLabel: "offline, disconnect, energy" },
      o.createElement("path", {
        d: "M21.25 12C21.25 17.1086 17.1086 21.25 12 21.25C6.89137 21.25 2.75 17.1086 2.75 12C2.75 6.89137 6.89137 2.75 12 2.75C17.1086 2.75 21.25 6.89137 21.25 12Z",
        stroke: "currentColor",
        strokeWidth: "1.5",
      }),
      o.createElement("path", {
        d: "M13.2691 10.8458L11.2424 9.49465C10.8195 9.21277 10.2525 9.29283 9.92426 9.68076L6.43815 13.8007C6.09353 14.208 6.54104 14.7996 7.02675 14.5789L10.2473 13.115C10.4046 13.0435 10.5878 13.0583 10.7316 13.1541L12.7583 14.5053C13.1811 14.7872 13.7481 14.7071 14.0764 14.3192L17.5625 10.1992C17.9071 9.79193 17.4596 9.20029 16.9739 9.42107L13.7533 10.885C13.596 10.9565 13.4129 10.9417 13.2691 10.8458Z",
        fill: "currentColor",
      }),
    ),
  g = i;
export { i as IconOffline, g as default };
