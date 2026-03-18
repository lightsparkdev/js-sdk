import o from "react";
import s from "react";
var i = ({
  children: t,
  size: r = 24,
  ariaLabel: n,
  color: p,
  ariaHidden: e = !0,
  style: a,
  ...d
}) =>
  s.createElement(
    "svg",
    {
      ...d,
      "aria-hidden": e,
      role: e ? void 0 : "img",
      width: typeof r == "number" ? `${r}px` : r,
      height: typeof r == "number" ? `${r}px` : r,
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      style: { color: p, ...a },
    },
    n && !e && s.createElement("title", null, n),
    t,
  );
var u = (t) =>
    o.createElement(
      i,
      { ...t, ariaLabel: "random, productivity, smart" },
      o.createElement("path", {
        d: "M12 17.75V21.25M12 2.75V6.25",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
      o.createElement("path", {
        d: "M17.75 12L21.25 12M2.75 12H11.5",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
      o.createElement("path", {
        d: "M5.45947 5.45898L12 12L5.45947 18.5405",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
      o.createElement("path", {
        d: "M16.0659 16.0654L18.5408 18.5403",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
      o.createElement("path", {
        d: "M16.0659 7.93386L18.5408 5.45898",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
    ),
  L = u;
export { u as IconRandom, L as default };
