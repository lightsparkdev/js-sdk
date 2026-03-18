import a from "react";
import n from "react";
var p = ({
  children: o,
  size: r = 24,
  ariaLabel: t,
  color: s,
  ariaHidden: e = !0,
  style: l,
  ...i
}) =>
  n.createElement(
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
    t && !e && n.createElement("title", null, t),
    o,
  );
var m = (o) =>
    a.createElement(
      p,
      { ...o, ariaLabel: "arrow-box-right, login, enter, door" },
      a.createElement("path", {
        d: "M14.75 3.75L17.25 3.75C18.9069 3.75 20.25 5.09315 20.25 6.75V17.25C20.25 18.9069 18.9069 20.25 17.25 20.25H14.75M15 12H3.75M15 12L11.5 15.5M15 12L11.5 8.5",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
    ),
  x = m;
export { m as IconArrowBoxRight, x as default };
