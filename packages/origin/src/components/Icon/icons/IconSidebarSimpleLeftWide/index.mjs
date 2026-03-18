import o from "react";
import p from "react";
var s = ({
  children: r,
  size: e = 24,
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
      width: typeof e == "number" ? `${e}px` : e,
      height: typeof e == "number" ? `${e}px` : e,
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      style: { color: a, ...i },
    },
    n && !t && p.createElement("title", null, n),
    r,
  );
var m = (r) =>
    o.createElement(
      s,
      { ...r, ariaLabel: "sidebar-simple-left-wide" },
      o.createElement("path", {
        d: "M2.75 7.75C2.75 6.09315 4.09315 4.75 5.75 4.75H18.25C19.9069 4.75 21.25 6.09315 21.25 7.75V16.25C21.25 17.9069 19.9069 19.25 18.25 19.25H5.75C4.09315 19.25 2.75 17.9069 2.75 16.25V7.75Z",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinejoin: "round",
      }),
      o.createElement("path", {
        d: "M8.25 5V12V19",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinejoin: "round",
      }),
    ),
  f = m;
export { m as IconSidebarSimpleLeftWide, f as default };
