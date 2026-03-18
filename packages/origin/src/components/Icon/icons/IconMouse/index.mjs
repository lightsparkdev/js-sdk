import s from "react";
import n from "react";
var p = ({
  children: r,
  size: e = 24,
  ariaLabel: t,
  color: a,
  ariaHidden: o = !0,
  style: l,
  ...i
}) =>
  n.createElement(
    "svg",
    {
      ...i,
      "aria-hidden": o,
      role: o ? void 0 : "img",
      width: typeof e == "number" ? `${e}px` : e,
      height: typeof e == "number" ? `${e}px` : e,
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      style: { color: a, ...l },
    },
    t && !o && n.createElement("title", null, t),
    r,
  );
var m = (r) =>
    s.createElement(
      p,
      { ...r, ariaLabel: "mouse" },
      s.createElement("path", {
        d: "M12 6.75V8.75M12 21.25C8.54822 21.25 5.75 18.4518 5.75 15V9C5.75 5.54822 8.54822 2.75 12 2.75C15.4518 2.75 18.25 5.54822 18.25 9V15C18.25 18.4518 15.4518 21.25 12 21.25Z",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
    ),
  d = m;
export { m as IconMouse, d as default };
