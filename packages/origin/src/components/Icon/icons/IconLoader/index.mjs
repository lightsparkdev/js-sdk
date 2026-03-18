import p from "react";
import n from "react";
var a = ({
  children: e,
  size: r = 24,
  ariaLabel: t,
  color: s,
  ariaHidden: o = !0,
  style: l,
  ...i
}) =>
  n.createElement(
    "svg",
    {
      ...i,
      "aria-hidden": o,
      role: o ? void 0 : "img",
      width: typeof r == "number" ? `${r}px` : r,
      height: typeof r == "number" ? `${r}px` : r,
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      style: { color: s, ...l },
    },
    t && !o && n.createElement("title", null, t),
    e,
  );
var m = (e) =>
    p.createElement(
      a,
      { ...e, ariaLabel: "loader" },
      p.createElement("path", {
        d: "M12.0003 2.75L12 6.25M12.0003 17.75V21.25M2.75 12.0007H6.25M17.75 12.0007H21.25M5.45948 5.45905L7.93414 7.93414M16.0661 16.0656L18.541 18.5405M5.45976 18.5412L7.93463 16.0664M16.0664 7.93463L18.5412 5.45976",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
    ),
  f = m;
export { m as IconLoader, f as default };
