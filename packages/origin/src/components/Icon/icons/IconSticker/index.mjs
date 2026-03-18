import t from "react";
import s from "react";
var p = ({
  children: e,
  size: r = 24,
  ariaLabel: n,
  color: a,
  ariaHidden: o = !0,
  style: l,
  ...i
}) =>
  s.createElement(
    "svg",
    {
      ...i,
      "aria-hidden": o,
      role: o ? void 0 : "img",
      width: typeof r == "number" ? `${r}px` : r,
      height: typeof r == "number" ? `${r}px` : r,
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      style: { color: a, ...l },
    },
    n && !o && s.createElement("title", null, n),
    e,
  );
var C = (e) =>
    t.createElement(
      p,
      { ...e, ariaLabel: "sticker, badge" },
      t.createElement("path", {
        d: "M12 21.25C17.1086 21.25 21.25 17.1086 21.25 12C21.25 11.3334 20.9367 10.7154 20.4653 10.244L13.756 3.53467C13.2846 3.0633 12.6666 2.75 12 2.75C6.89137 2.75 2.75 6.89137 2.75 12C2.75 17.1086 6.89137 21.25 12 21.25Z",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinejoin: "round",
      }),
      t.createElement("path", {
        d: "M13.0416 3C12.4995 7.5 16.4993 11.5 20.9995 10.9578",
        stroke: "currentColor",
        strokeWidth: "1.5",
      }),
      t.createElement("path", {
        d: "M14 5.5L18.5 10",
        stroke: "currentColor",
        strokeWidth: "2",
        strokeLinecap: "square",
      }),
    ),
  h = C;
export { C as IconSticker, h as default };
