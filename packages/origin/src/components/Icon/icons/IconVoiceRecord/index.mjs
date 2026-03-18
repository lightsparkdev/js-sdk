import o from "react";
import c from "react";
var s = ({
  children: e,
  size: r = 24,
  ariaLabel: n,
  color: l,
  ariaHidden: t = !0,
  style: p,
  ...i
}) =>
  c.createElement(
    "svg",
    {
      ...i,
      "aria-hidden": t,
      role: t ? void 0 : "img",
      width: typeof r == "number" ? `${r}px` : r,
      height: typeof r == "number" ? `${r}px` : r,
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      style: { color: l, ...p },
    },
    n && !t && c.createElement("title", null, n),
    e,
  );
var a = (e) =>
    o.createElement(
      s,
      { ...e, ariaLabel: "voice-record" },
      o.createElement("path", {
        d: "M2.75 8.75V11.25M6.25 3.75V16.25M9.75 6.75V13.25M13.25 4.75V8.75",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
      o.createElement("circle", {
        cx: "16.75",
        cy: "15.75",
        r: "4.5",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
      o.createElement("circle", {
        cx: "16.75",
        cy: "15.75",
        r: "2.75",
        fill: "currentColor",
      }),
    ),
  f = a;
export { a as IconVoiceRecord, f as default };
