import a from "react";
import n from "react";
var l = ({
  children: e,
  size: r = 24,
  ariaLabel: o,
  color: p,
  ariaHidden: t = !0,
  style: s,
  ...m
}) =>
  n.createElement(
    "svg",
    {
      ...m,
      "aria-hidden": t,
      role: t ? void 0 : "img",
      width: typeof r == "number" ? `${r}px` : r,
      height: typeof r == "number" ? `${r}px` : r,
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      style: { color: p, ...s },
    },
    o && !t && n.createElement("title", null, o),
    e,
  );
var c = (e) =>
    a.createElement(
      l,
      { ...e, ariaLabel: "plus-small, add small" },
      a.createElement("path", {
        d: "M12 6.75V12M12 12V17.25M12 12H6.75M12 12H17.25",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
      }),
    ),
  f = c;
export { c as IconPlusSmall, f as default };
