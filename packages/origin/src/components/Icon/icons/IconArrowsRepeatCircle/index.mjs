import o from "react";
import s from "react";
var p = ({
  children: e,
  size: r = 24,
  ariaLabel: n,
  color: a,
  ariaHidden: t = !0,
  style: i,
  ...l
}) =>
  s.createElement(
    "svg",
    {
      ...l,
      "aria-hidden": t,
      role: t ? void 0 : "img",
      width: typeof r == "number" ? `${r}px` : r,
      height: typeof r == "number" ? `${r}px` : r,
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      style: { color: a, ...i },
    },
    n && !t && s.createElement("title", null, n),
    e,
  );
var c = (e) =>
    o.createElement(
      p,
      { ...e, ariaLabel: "arrows-repeat-circle, repost" },
      o.createElement("path", {
        d: "M10.75 1.5L14.25 4.75L10.75 8",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
      o.createElement("path", {
        d: "M13.25 16L9.75 19.25L13.25 22.5",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
      o.createElement("path", {
        d: "M10.75 19.2502H14C18.0041 19.2502 21.25 16.0043 21.25 12.0002C21.25 9.81528 20.2834 7.85607 18.7546 6.52686",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
      }),
      o.createElement("path", {
        d: "M13.25 4.75H10C5.99593 4.75 2.75 7.99594 2.75 12C2.75 14.1854 3.71696 16.145 5.24638 17.4742",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
      }),
    ),
  m = c;
export { c as IconArrowsRepeatCircle, m as default };
