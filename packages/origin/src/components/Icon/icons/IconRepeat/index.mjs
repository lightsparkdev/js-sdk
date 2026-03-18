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
var m = (r) =>
    a.createElement(
      p,
      { ...r, ariaLabel: "repeat" },
      a.createElement("path", {
        d: "M7.25 18.25H5.75C4.09315 18.25 2.75 16.9069 2.75 15.25V6.75C2.75 5.09315 4.09315 3.75 5.75 3.75H18.25C19.9069 3.75 21.25 5.09315 21.25 6.75V15.25C21.25 16.9069 19.9069 18.25 18.25 18.25H12.25M15 15L11.75 18.25L15 21.25",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
    ),
  d = m;
export { m as IconRepeat, d as default };
