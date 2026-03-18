import a from "react";
import n from "react";
var c = ({
  children: r,
  size: e = 24,
  ariaLabel: t,
  color: p,
  ariaHidden: o = !0,
  style: l,
  ...s
}) =>
  n.createElement(
    "svg",
    {
      ...s,
      "aria-hidden": o,
      role: o ? void 0 : "img",
      width: typeof e == "number" ? `${e}px` : e,
      height: typeof e == "number" ? `${e}px` : e,
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      style: { color: p, ...l },
    },
    t && !o && n.createElement("title", null, t),
    r,
  );
var i = (r) =>
    a.createElement(
      c,
      {
        ...r,
        ariaLabel:
          "circle-check, check radio, circle, checkbox, check, checkmark, confirm",
      },
      a.createElement("path", {
        d: "M15 9.5L10.5 15L8.5 13M21.25 12C21.25 17.1086 17.1086 21.25 12 21.25C6.89137 21.25 2.75 17.1086 2.75 12C2.75 6.89137 6.89137 2.75 12 2.75C17.1086 2.75 21.25 6.89137 21.25 12Z",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
    ),
  u = i;
export { i as IconCircleCheck, u as default };
