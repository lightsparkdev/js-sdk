import o from "react";
import s from "react";
var i = ({
  children: e,
  size: r = 24,
  ariaLabel: n,
  color: p,
  ariaHidden: t = !0,
  style: d,
  ...a
}) =>
  s.createElement(
    "svg",
    {
      ...a,
      "aria-hidden": t,
      role: t ? void 0 : "img",
      width: typeof r == "number" ? `${r}px` : r,
      height: typeof r == "number" ? `${r}px` : r,
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      style: { color: p, ...d },
    },
    n && !t && s.createElement("title", null, n),
    e,
  );
var u = (e) =>
    o.createElement(
      i,
      { ...e, ariaLabel: "ongoing, moving" },
      o.createElement("path", {
        d: "M12 21.25C6.89137 21.25 2.75 17.1086 2.75 12C2.75 6.89137 6.89137 2.75 12 2.75",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
      o.createElement("path", {
        d: "M18.8947 18.166C18.2426 18.8946 17.4767 19.5192 16.625 20.0119",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
      o.createElement("path", {
        d: "M16.625 3.9873C17.4767 4.47999 18.2426 5.10459 18.8947 5.83315",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
      o.createElement("path", {
        d: "M21.0752 10.2012C21.19 10.7832 21.2501 11.3849 21.2501 12.0007C21.2501 12.6164 21.19 13.2181 21.0752 13.8001",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
      o.createElement("path", {
        d: "M12.75 8.5L16.25 12L12.75 15.5",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
      o.createElement("path", {
        d: "M15.25 12H7.75",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
    ),
  h = u;
export { u as IconOngoing, h as default };
