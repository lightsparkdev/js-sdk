import p from "react";
import n from "react";
var a = ({
  children: e,
  size: r = 24,
  ariaLabel: o,
  color: s,
  ariaHidden: t = !0,
  style: l,
  ...c
}) =>
  n.createElement(
    "svg",
    {
      ...c,
      "aria-hidden": t,
      role: t ? void 0 : "img",
      width: typeof r == "number" ? `${r}px` : r,
      height: typeof r == "number" ? `${r}px` : r,
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      style: { color: s, ...l },
    },
    o && !t && n.createElement("title", null, o),
    e,
  );
var i = (e) =>
    p.createElement(
      a,
      { ...e, ariaLabel: "spacebar" },
      p.createElement("path", {
        d: "M2.75 13.75V16.25C2.75 17.9069 4.09315 19.25 5.75 19.25H18.25C19.9069 19.25 21.25 17.9069 21.25 16.25V13.75",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
    ),
  d = i;
export { i as IconSpacebar, d as default };
