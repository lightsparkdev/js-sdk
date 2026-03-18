import e from "react";
import s from "react";
var p = ({
  children: o,
  size: r = 24,
  ariaLabel: n,
  color: a,
  ariaHidden: t = !0,
  style: l,
  ...i
}) =>
  s.createElement(
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
      style: { color: a, ...l },
    },
    n && !t && s.createElement("title", null, n),
    o,
  );
var c = (o) =>
    e.createElement(
      p,
      { ...o, ariaLabel: "user-remove, people, person, member" },
      e.createElement("circle", {
        cx: "12",
        cy: "7.75",
        r: "4.5",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
      e.createElement("path", {
        d: "M12.0018 12.25C8.22236 12.25 5.87133 14.4212 4.94874 17.2952C4.44232 18.8728 5.84498 20.25 7.50184 20.25H11.2518",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
      e.createElement("path", {
        d: "M15.5 15L18 17.5M18 17.5L20.5 20M18 17.5L20.5 15M18 17.5L15.5 20",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
      }),
    ),
  k = c;
export { c as IconUserRemove, k as default };
