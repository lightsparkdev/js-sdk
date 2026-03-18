import p from "react";
import n from "react";
var a = ({
  children: r,
  size: e = 24,
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
      width: typeof e == "number" ? `${e}px` : e,
      height: typeof e == "number" ? `${e}px` : e,
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      style: { color: s, ...l },
    },
    t && !o && n.createElement("title", null, t),
    r,
  );
var m = (r) =>
    p.createElement(
      a,
      { ...r, ariaLabel: "phone-dynamic-island" },
      p.createElement("path", {
        d: "M10.75 4.25H13.25M8.75 22.25H15.25C16.9069 22.25 18.25 20.9069 18.25 19.25V4.75C18.25 3.09315 16.9069 1.75 15.25 1.75H8.75C7.09315 1.75 5.75 3.09315 5.75 4.75V19.25C5.75 20.9069 7.09315 22.25 8.75 22.25Z",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
    ),
  f = m;
export { m as IconPhoneDynamicIsland, f as default };
