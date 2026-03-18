import o from "react";
import a from "react";
var p = ({
  children: e,
  size: r = 24,
  ariaLabel: n,
  color: s,
  ariaHidden: t = !0,
  style: l,
  ...i
}) =>
  a.createElement(
    "svg",
    {
      ...i,
      "aria-hidden": t,
      role: t ? void 0 : "img",
      width: typeof r == "number" ? `${r}px` : r,
      height: typeof r == "number" ? `${r}px` : r,
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      style: { color: s, ...l },
    },
    n && !t && a.createElement("title", null, n),
    e,
  );
var c = (e) =>
    o.createElement(
      p,
      { ...e, ariaLabel: "textarea-drag" },
      o.createElement("path", {
        d: "M14.75 21.25L21.25 14.75",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
      }),
      o.createElement("path", {
        d: "M6.75 21.25L21.25 6.75",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
      }),
    ),
  g = c;
export { c as IconTextareaDrag, g as default };
