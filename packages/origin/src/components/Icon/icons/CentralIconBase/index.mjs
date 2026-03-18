import o from "react";
var a = ({
  children: n,
  size: t = 24,
  ariaLabel: r,
  color: p,
  ariaHidden: e = !0,
  style: l,
  ...s
}) =>
  o.createElement(
    "svg",
    {
      ...s,
      "aria-hidden": e,
      role: e ? void 0 : "img",
      width: typeof t == "number" ? `${t}px` : t,
      height: typeof t == "number" ? `${t}px` : t,
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      style: { color: p, ...l },
    },
    r && !e && o.createElement("title", null, r),
    n,
  );
export { a as CentralIconBase };
