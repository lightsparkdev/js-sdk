import o from "react";
import s from "react";
var p = ({
  children: t,
  size: r = 24,
  ariaLabel: n,
  color: a,
  ariaHidden: e = !0,
  style: i,
  ...l
}) =>
  s.createElement(
    "svg",
    {
      ...l,
      "aria-hidden": e,
      role: e ? void 0 : "img",
      width: typeof r == "number" ? `${r}px` : r,
      height: typeof r == "number" ? `${r}px` : r,
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      style: { color: a, ...i },
    },
    n && !e && s.createElement("title", null, n),
    t,
  );
var d = (t) =>
    o.createElement(
      p,
      { ...t, ariaLabel: "voice-mid, wave" },
      o.createElement("path", {
        d: "M7.75 5.75V18.25",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
      }),
      o.createElement("path", {
        d: "M3.75 10.75V13.25",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
      }),
      o.createElement("path", {
        d: "M12 9.75V14.25",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
      }),
      o.createElement("path", {
        d: "M16.25 7.75V16.25",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
      }),
      o.createElement("path", {
        d: "M20.25 10.75V13.25",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
      }),
    ),
  m = d;
export { d as IconVoiceMid, m as default };
