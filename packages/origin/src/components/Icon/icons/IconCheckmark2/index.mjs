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
var m = (e) =>
    p.createElement(
      a,
      { ...e, ariaLabel: "checkmark-2" },
      p.createElement("path", {
        d: "M2.75 15.0938L9 20.25L21.25 3.75",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
    ),
  h = m;
export { m as IconCheckmark2, h as default };
