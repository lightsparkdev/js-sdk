import p from "react";
import n from "react";
var a = ({
  children: e,
  size: r = 24,
  ariaLabel: o,
  color: s,
  ariaHidden: t = !0,
  style: l,
  ...i
}) =>
  n.createElement(
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
    o && !t && n.createElement("title", null, o),
    e,
  );
var m = (e) =>
    p.createElement(
      a,
      { ...e, ariaLabel: "plus-large, add large" },
      p.createElement("path", {
        d: "M12 3.75V12M12 12V20.25M12 12H3.75M12 12H20.25",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
    ),
  C = m;
export { m as IconPlusLarge, C as default };
