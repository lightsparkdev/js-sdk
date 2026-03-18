import l from "react";
import n from "react";
var a = ({
  children: t,
  size: e = 24,
  ariaLabel: o,
  color: p,
  ariaHidden: r = !0,
  style: s,
  ...C
}) =>
  n.createElement(
    "svg",
    {
      ...C,
      "aria-hidden": r,
      role: r ? void 0 : "img",
      width: typeof e == "number" ? `${e}px` : e,
      height: typeof e == "number" ? `${e}px` : e,
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      style: { color: p, ...s },
    },
    o && !r && n.createElement("title", null, o),
    t,
  );
var i = (t) =>
    l.createElement(
      a,
      { ...t, ariaLabel: "wallet-1" },
      l.createElement("path", {
        d: "M2.75 7.75H21.25M2.75 7.75V10.75M2.75 7.75C2.75 6.09315 4.09315 4.75 5.75 4.75H18.25C19.9069 4.75 21.25 6.09315 21.25 7.75M21.25 7.75V10.75M21.25 10.75V16.25C21.25 17.9069 19.9069 19.25 18.25 19.25H5.75C4.09315 19.25 2.75 17.9069 2.75 16.25V10.75M21.25 10.75H15.25C15.25 12.1307 14.1307 13.25 12.75 13.25H11.25C9.86929 13.25 8.75 12.1307 8.75 10.75H2.75",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinejoin: "round",
      }),
    ),
  g = i;
export { i as IconWallet1, g as default };
