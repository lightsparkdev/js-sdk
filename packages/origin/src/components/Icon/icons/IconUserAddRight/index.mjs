import e from "react";
import s from "react";
var p = ({
  children: o,
  size: r = 24,
  ariaLabel: n,
  color: i,
  ariaHidden: t = !0,
  style: l,
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
      style: { color: i, ...l },
    },
    n && !t && s.createElement("title", null, n),
    o,
  );
var c = (o) =>
    e.createElement(
      p,
      { ...o, ariaLabel: "user-add-right, people, person, member" },
      e.createElement("path", {
        d: "M4.50184 20.25C2.84498 20.25 1.44232 18.8728 1.94874 17.2952C2.87133 14.4212 5.22236 12.25 9.00184 12.25C12.7783 12.25 14.986 14.4178 15.8403 17.2885C16.3129 18.8765 14.9087 20.25 13.2518 20.25H4.50184Z",
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
        d: "M20 8.5V15M23.25 11.75H16.75",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
    ),
  h = c;
export { c as IconUserAddRight, h as default };
