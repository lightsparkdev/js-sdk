import o from "react";
import l from "react";
var s = ({
  children: e,
  size: r = 24,
  ariaLabel: n,
  color: a,
  ariaHidden: t = !0,
  style: p,
  ...C
}) =>
  l.createElement(
    "svg",
    {
      ...C,
      "aria-hidden": t,
      role: t ? void 0 : "img",
      width: typeof r == "number" ? `${r}px` : r,
      height: typeof r == "number" ? `${r}px` : r,
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      style: { color: a, ...p },
    },
    n && !t && l.createElement("title", null, n),
    e,
  );
var i = (e) =>
    o.createElement(
      s,
      { ...e, ariaLabel: "wallet-3" },
      o.createElement("path", {
        d: "M3.75 6.5V17.25C3.75 18.9069 5.09315 20.25 6.75 20.25H17.25C18.9069 20.25 20.25 18.9069 20.25 17.25V11.75C20.25 10.0931 18.9069 8.75 17.25 8.75H16.25M3.75 6.5C3.75 7.74264 4.75736 8.75 6 8.75H16.25M3.75 6.5C3.75 4.98122 4.98122 3.75 6.5 3.75H14.1667C15.3173 3.75 16.25 4.68274 16.25 5.83333V8.75",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "square",
        strokeLinejoin: "round",
      }),
      o.createElement("path", {
        d: "M15.5 15.25C15.9142 15.25 16.25 14.9142 16.25 14.5C16.25 14.0858 15.9142 13.75 15.5 13.75C15.0858 13.75 14.75 14.0858 14.75 14.5C14.75 14.9142 15.0858 15.25 15.5 15.25Z",
        fill: "currentColor",
        stroke: "currentColor",
        strokeWidth: "0.5",
        strokeLinejoin: "round",
      }),
    ),
  f = i;
export { i as IconWallet3, f as default };
