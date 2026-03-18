import a from "react";
import n from "react";
var p = ({
  children: r,
  size: e = 24,
  ariaLabel: o,
  color: l,
  ariaHidden: t = !0,
  style: s,
  ...C
}) =>
  n.createElement(
    "svg",
    {
      ...C,
      "aria-hidden": t,
      role: t ? void 0 : "img",
      width: typeof e == "number" ? `${e}px` : e,
      height: typeof e == "number" ? `${e}px` : e,
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      style: { color: l, ...s },
    },
    o && !t && n.createElement("title", null, o),
    r,
  );
var i = (r) =>
    a.createElement(
      p,
      { ...r, ariaLabel: "paper-plane-top-right, send" },
      a.createElement("path", {
        d: "M1.46783 6.05797C0.265136 4.9889 1.02132 3 2.63047 3H21.2788C22.6218 3 23.4643 4.45027 22.799 5.61691L13.6528 21.6554C12.8643 23.038 10.7893 22.7356 10.4282 21.1855L8.36566 12.3316L14.9744 8.65542C15.3364 8.45407 15.4666 7.9974 15.2653 7.63542C15.0639 7.27344 14.6072 7.14322 14.2453 7.34458L7.27632 11.2211L1.46783 6.05797Z",
        fill: "currentColor",
      }),
    ),
  u = i;
export { i as IconPaperPlaneTopRight, u as default };
