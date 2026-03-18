import o from "react";
import a from "react";
var p = ({
  children: t,
  size: r = 24,
  ariaLabel: n,
  color: s,
  ariaHidden: e = !0,
  style: l,
  ...i
}) =>
  a.createElement(
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
      style: { color: s, ...l },
    },
    n && !e && a.createElement("title", null, n),
    t,
  );
var C = (t) =>
    o.createElement(
      p,
      { ...t, ariaLabel: "bell, notification, activity, alert" },
      o.createElement("path", {
        d: "M4.35988 9.38732C4.89728 5.58041 8.15531 2.75 12 2.75C15.8446 2.75 19.1026 5.58042 19.64 9.38732L20.2673 13.8307C20.5222 15.6364 19.1204 17.25 17.2967 17.25H6.70319C4.87955 17.25 3.47773 15.6364 3.73264 13.8307L4.35988 9.38732Z",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
      o.createElement("path", {
        d: "M16 17.25C16 19.4591 14.2091 21.25 12 21.25C9.79086 21.25 8 19.4591 8 17.25",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
    ),
  f = C;
export { C as IconBell, f as default };
