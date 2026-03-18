import a from "react";
import n from "react";
var p = ({
  children: r,
  size: e = 24,
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
      width: typeof e == "number" ? `${e}px` : e,
      height: typeof e == "number" ? `${e}px` : e,
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      style: { color: s, ...l },
    },
    o && !t && n.createElement("title", null, o),
    r,
  );
var C = (r) =>
    a.createElement(
      p,
      { ...r, ariaLabel: "shield-2, safety, privacy" },
      a.createElement("path", {
        d: "M3.75 7.73608C3.75 6.532 4.4699 5.44459 5.57835 4.97434L10.8284 2.74706C11.5772 2.42939 12.4228 2.42939 13.1716 2.74706L18.4216 4.97434C19.5301 5.44459 20.25 6.532 20.25 7.73608V13C20.25 17.5563 16.5563 21.25 12 21.25C7.44365 21.25 3.75 17.5563 3.75 13V7.73608Z",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
    ),
  f = C;
export { C as IconShield2, f as default };
