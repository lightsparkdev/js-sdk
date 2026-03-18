import a from "react";
import n from "react";
var p = ({
  children: e,
  size: r = 24,
  ariaLabel: o,
  color: l,
  ariaHidden: t = !0,
  style: s,
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
      style: { color: l, ...s },
    },
    o && !t && n.createElement("title", null, o),
    e,
  );
var i = (e) =>
    a.createElement(
      p,
      { ...e, ariaLabel: "circle-plus, add" },
      a.createElement("path", {
        d: "M16.2426 12.0005H7.75736M12 16.2431V7.75781M21.25 12C21.25 17.1086 17.1086 21.25 12 21.25C6.89137 21.25 2.75 17.1086 2.75 12C2.75 6.89137 6.89137 2.75 12 2.75C17.1086 2.75 21.25 6.89137 21.25 12Z",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
      }),
    ),
  f = i;
export { i as IconCirclePlus, f as default };
