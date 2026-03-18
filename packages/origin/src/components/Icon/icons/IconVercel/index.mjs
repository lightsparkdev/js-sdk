import p from "react";
import n from "react";
var l = ({
  children: r,
  size: e = 24,
  ariaLabel: o,
  color: a,
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
      width: typeof e == "number" ? `${e}px` : e,
      height: typeof e == "number" ? `${e}px` : e,
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      style: { color: a, ...s },
    },
    o && !t && n.createElement("title", null, o),
    r,
  );
var m = (r) =>
    p.createElement(
      l,
      { ...r, ariaLabel: "vercel" },
      p.createElement("path", {
        d: "M11.8632 2.17999L22.7264 20.9958H1L11.8632 2.17999Z",
        fill: "currentColor",
      }),
    ),
  g = m;
export { m as IconVercel, g as default };
