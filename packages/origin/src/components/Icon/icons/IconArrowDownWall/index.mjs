import o from "react";
import s from "react";
var p = ({
  children: e,
  size: r = 24,
  ariaLabel: n,
  color: a,
  ariaHidden: t = !0,
  style: l,
  ...i
}) =>
  s.createElement(
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
      style: { color: a, ...l },
    },
    n && !t && s.createElement("title", null, n),
    e,
  );
var d = (e) =>
    o.createElement(
      p,
      { ...e, ariaLabel: "arrow-down-wall" },
      o.createElement("path", {
        d: "M19.25 3.75L4.75 3.75",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
      }),
      o.createElement("path", {
        d: "M16.5 15.75L12 20.25L7.5 15.75",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
      o.createElement("path", {
        d: "M12 7.75V19.5",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
    ),
  h = d;
export { d as IconArrowDownWall, h as default };
