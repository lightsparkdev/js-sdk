import s from "react";
import n from "react";
var p = ({
  children: r,
  size: e = 24,
  ariaLabel: o,
  color: a,
  ariaHidden: t = !0,
  style: l,
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
      style: { color: a, ...l },
    },
    o && !t && n.createElement("title", null, o),
    r,
  );
var i = (r) =>
    s.createElement(
      p,
      { ...r, ariaLabel: "usb-c, type-c" },
      s.createElement("path", {
        d: "M5.75 12H18.25M6 17.25H18C20.8995 17.25 23.25 14.8995 23.25 12C23.25 9.10051 20.8995 6.75 18 6.75H6C3.10051 6.75 0.75 9.10051 0.75 12C0.75 14.8995 3.10051 17.25 6 17.25Z",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
    ),
  d = i;
export { i as IconUsbC, d as default };
