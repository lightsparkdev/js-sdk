import o from "react";
import s from "react";
var p = ({
  children: t,
  size: r = 24,
  ariaLabel: n,
  color: a,
  ariaHidden: e = !0,
  style: l,
  ...i
}) =>
  s.createElement(
    "svg",
    {
      ...i,
      "aria-hidden": e,
      role: e ? void 0 : "img",
      width: typeof r == "number" ? `${r}px` : r,
      height: typeof r == "number" ? `${r}px` : r,
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      style: { color: a, ...l },
    },
    n && !e && s.createElement("title", null, n),
    t,
  );
var c = (t) =>
    o.createElement(
      p,
      { ...t, ariaLabel: "voice-low, wave" },
      o.createElement("path", {
        d: "M7.75 6.75V17.25",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
      }),
      o.createElement("path", {
        d: "M3.75 11.25V12.75",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
      }),
      o.createElement("path", {
        d: "M12 10.75V13.25",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
      }),
      o.createElement("path", {
        d: "M16.25 8.75V15.25",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
      }),
      o.createElement("path", {
        d: "M20.25 11.25V12.75",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
      }),
    ),
  m = c;
export { c as IconVoiceLow, m as default };
