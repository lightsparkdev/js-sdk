import e from "react";
import s from "react";
var a = ({
  children: o,
  size: r = 24,
  ariaLabel: n,
  color: p,
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
      style: { color: p, ...i },
    },
    n && !t && s.createElement("title", null, n),
    o,
  );
var d = (o) =>
    e.createElement(
      a,
      { ...o, ariaLabel: "trash-can-simple, delete, remove, garbage, waste" },
      e.createElement("path", {
        d: "M4.75 6.5L5.58982 18.4601C5.70016 20.0316 7.00714 21.25 8.58245 21.25H15.4175C16.9929 21.25 18.2998 20.0316 18.4102 18.4601L19.25 6.5",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
      e.createElement("path", {
        d: "M3.25 5.75H20.75",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
      e.createElement("path", {
        d: "M8.52466 5.58289C8.73085 3.84652 10.2082 2.5 12.0001 2.5C13.7919 2.5 15.2693 3.84652 15.4755 5.58289",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
    ),
  h = d;
export { d as IconTrashCanSimple, h as default };
