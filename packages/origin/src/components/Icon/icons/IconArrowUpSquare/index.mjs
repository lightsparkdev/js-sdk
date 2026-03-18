import o from "react";
import p from "react";
var s = ({
  children: e,
  size: r = 24,
  ariaLabel: n,
  color: a,
  ariaHidden: t = !0,
  style: i,
  ...l
}) =>
  p.createElement(
    "svg",
    {
      ...l,
      "aria-hidden": t,
      role: t ? void 0 : "img",
      width: typeof r == "number" ? `${r}px` : r,
      height: typeof r == "number" ? `${r}px` : r,
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      style: { color: a, ...i },
    },
    n && !t && p.createElement("title", null, n),
    e,
  );
var u = (e) =>
    o.createElement(
      s,
      { ...e, ariaLabel: "arrow-up-square, top" },
      o.createElement("path", {
        d: "M17.25 3.75H6.75C5.09315 3.75 3.75 5.09315 3.75 6.75V17.25C3.75 18.9069 5.09315 20.25 6.75 20.25H17.25C18.9069 20.25 20.25 18.9069 20.25 17.25V6.75C20.25 5.09315 18.9069 3.75 17.25 3.75Z",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinejoin: "round",
      }),
      o.createElement("path", {
        d: "M12 16.25V8.5",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
      o.createElement("path", {
        d: "M8.75 11L12 7.75L15.25 11",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
    ),
  h = u;
export { u as IconArrowUpSquare, h as default };
