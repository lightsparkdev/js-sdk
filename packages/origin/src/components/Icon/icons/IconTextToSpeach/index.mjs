import o from "react";
import s from "react";
var p = ({
  children: e,
  size: r = 24,
  ariaLabel: n,
  color: i,
  ariaHidden: t = !0,
  style: a,
  ...d
}) =>
  s.createElement(
    "svg",
    {
      ...d,
      "aria-hidden": t,
      role: t ? void 0 : "img",
      width: typeof r == "number" ? `${r}px` : r,
      height: typeof r == "number" ? `${r}px` : r,
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      style: { color: i, ...a },
    },
    n && !t && s.createElement("title", null, n),
    e,
  );
var l = (e) =>
    o.createElement(
      p,
      { ...e, ariaLabel: "text-to-speach" },
      o.createElement("path", {
        d: "M10.75 14.75V17.25",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
      o.createElement("path", {
        d: "M14.25 7.75V20.25",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
      o.createElement("path", {
        d: "M17.75 10.75V17.25",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
      o.createElement("path", {
        d: "M21.25 12.75V15.25",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
      o.createElement("path", {
        d: "M2.75 5.25V3.75H7M11.25 5.25V3.75H7M7 3.75V12.25M7 12.25H5.25M7 12.25H8.75",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
    ),
  m = l;
export { l as IconTextToSpeach, m as default };
