import e from "react";
import s from "react";
var p = ({
  children: o,
  size: r = 24,
  ariaLabel: n,
  color: l,
  ariaHidden: t = !0,
  style: i,
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
      style: { color: l, ...i },
    },
    n && !t && s.createElement("title", null, n),
    o,
  );
var m = (o) =>
    e.createElement(
      p,
      { ...o, ariaLabel: "user-remove-right, people, person, member" },
      e.createElement("path", {
        d: "M4.5 20.25C2.84315 20.25 1.44049 18.8728 1.9469 17.2952C2.86949 14.4212 5.22053 12.25 9 12.25C12.7765 12.25 14.9842 14.4178 15.8385 17.2885C16.3111 18.8765 14.9069 20.25 13.25 20.25H4.5Z",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinejoin: "round",
      }),
      e.createElement("circle", {
        cx: "9",
        cy: "7.75",
        r: "4.5",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinejoin: "round",
      }),
      e.createElement("path", {
        d: "M17.5 9L20 11.5M20 11.5L22.5 14M20 11.5L22.5 9M20 11.5L17.5 14",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
      }),
    ),
  h = m;
export { m as IconUserRemoveRight, h as default };
