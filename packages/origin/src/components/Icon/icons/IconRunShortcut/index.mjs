import p from "react";
import n from "react";
var s = ({
  children: t,
  size: r = 24,
  ariaLabel: o,
  color: a,
  ariaHidden: e = !0,
  style: l,
  ...c
}) =>
  n.createElement(
    "svg",
    {
      ...c,
      "aria-hidden": e,
      role: e ? void 0 : "img",
      width: typeof r == "number" ? `${r}px` : r,
      height: typeof r == "number" ? `${r}px` : r,
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      style: { color: a, ...l },
    },
    o && !e && n.createElement("title", null, o),
    t,
  );
var i = (t) =>
    p.createElement(
      s,
      { ...t, ariaLabel: "run-shortcut,slash" },
      p.createElement("path", {
        d: "M9.75 16.75L14.25 7.25M6.75 3.75H17.25C18.9069 3.75 20.25 5.09315 20.25 6.75V17.25C20.25 18.9069 18.9069 20.25 17.25 20.25H6.75C5.09315 20.25 3.75 18.9069 3.75 17.25V6.75C3.75 5.09315 5.09315 3.75 6.75 3.75Z",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
    ),
  f = i;
export { i as IconRunShortcut, f as default };
