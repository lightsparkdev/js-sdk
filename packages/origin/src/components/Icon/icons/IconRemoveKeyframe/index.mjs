import t from "react";
import s from "react";
var p = ({
  children: r,
  size: e = 24,
  ariaLabel: n,
  color: a,
  ariaHidden: o = !0,
  style: l,
  ...m
}) =>
  s.createElement(
    "svg",
    {
      ...m,
      "aria-hidden": o,
      role: o ? void 0 : "img",
      width: typeof e == "number" ? `${e}px` : e,
      height: typeof e == "number" ? `${e}px` : e,
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      style: { color: a, ...l },
    },
    n && !o && s.createElement("title", null, n),
    r,
  );
var i = (r) =>
    t.createElement(
      p,
      { ...r, ariaLabel: "remove-keyframe, rhombus" },
      t.createElement("path", {
        d: "M14.1209 3.62135C12.9493 2.44978 11.0498 2.44978 9.87823 3.62135L3.62087 9.87868C2.4493 11.0503 2.44929 12.9497 3.62086 14.1213L9.87822 20.3787C11.0498 21.5503 12.9493 21.5503 14.1209 20.3787L20.3782 14.1213C21.5498 12.9497 21.5498 11.0503 20.3782 9.87868L14.1209 3.62135Z",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinejoin: "round",
      }),
      t.createElement("path", {
        d: "M9.75 12H14.25",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
    ),
  f = i;
export { i as IconRemoveKeyframe, f as default };
