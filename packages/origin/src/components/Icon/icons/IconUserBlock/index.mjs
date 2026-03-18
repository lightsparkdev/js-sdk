import e from "react";
import s from "react";
var p = ({
  children: o,
  size: r = 24,
  ariaLabel: n,
  color: l,
  ariaHidden: t = !0,
  style: c,
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
      style: { color: l, ...c },
    },
    n && !t && s.createElement("title", null, n),
    o,
  );
var a = (o) =>
    e.createElement(
      p,
      { ...o, ariaLabel: "user-block, people, person, member, blocked" },
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
        d: "M12.0018 12.25C8.22236 12.25 5.87133 14.4212 4.94874 17.2952C4.44232 18.8728 5.84498 20.25 7.50184 20.25H11.252",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
      e.createElement("circle", {
        cx: "18",
        cy: "17.25",
        r: "3.5",
        stroke: "currentColor",
        strokeWidth: "1.5",
      }),
      e.createElement("path", {
        d: "M15.7461 19.5L20.2461 15",
        stroke: "currentColor",
        strokeWidth: "1.5",
      }),
    ),
  C = a;
export { a as IconUserBlock, C as default };
