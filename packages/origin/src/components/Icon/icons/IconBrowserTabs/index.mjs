import o from "react";
import s from "react";
var p = ({
  children: e,
  size: r = 24,
  ariaLabel: n,
  color: a,
  ariaHidden: t = !0,
  style: i,
  ...l
}) =>
  s.createElement(
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
    n && !t && s.createElement("title", null, n),
    e,
  );
var u = (e) =>
    o.createElement(
      p,
      { ...e, ariaLabel: "browser-tabs, tab-groups" },
      o.createElement("path", {
        d: "M18.25 4.75H5.75C4.09315 4.75 2.75 6.09315 2.75 7.75V16.25C2.75 17.9069 4.09315 19.25 5.75 19.25H18.25C19.9069 19.25 21.25 17.9069 21.25 16.25V7.75C21.25 6.09315 19.9069 4.75 18.25 4.75Z",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
      o.createElement("path", {
        d: "M5.75 7.75L11.25 7.75",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
      o.createElement("path", {
        d: "M17.25 7.75H18.25",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
      o.createElement("path", {
        d: "M13.75 7.75H14.75",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
    ),
  m = u;
export { u as IconBrowserTabs, m as default };
