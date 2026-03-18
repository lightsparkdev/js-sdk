import p from "react";
import n from "react";
var a = ({
  children: r,
  size: t = 24,
  ariaLabel: o,
  color: l,
  ariaHidden: e = !0,
  style: s,
  ...i
}) =>
  n.createElement(
    "svg",
    {
      ...i,
      "aria-hidden": e,
      role: e ? void 0 : "img",
      width: typeof t == "number" ? `${t}px` : t,
      height: typeof t == "number" ? `${t}px` : t,
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      style: { color: l, ...s },
    },
    o && !e && n.createElement("title", null, o),
    r,
  );
var C = (r) =>
    p.createElement(
      a,
      { ...r, ariaLabel: "antigravity" },
      p.createElement("path", {
        d: "M20.5324 21.2328C21.7048 22.1122 23.4635 21.526 21.8514 19.9138C17.015 15.224 18.0409 2.32715 12.0321 2.32715C6.02333 2.32715 7.04921 15.224 2.21288 19.9138C0.45421 21.6725 2.35942 22.1122 3.53188 21.2328C8.07512 18.1552 7.782 12.7326 12.0321 12.7326C16.2822 12.7326 15.9891 18.1552 20.5324 21.2328Z",
        fill: "currentColor",
      }),
    ),
  u = C;
export { C as IconAntigravity, u as default };
