import s from "react";
import n from "react";
var p = ({
  children: r,
  size: e = 24,
  ariaLabel: t,
  color: l,
  ariaHidden: o = !0,
  style: a,
  ...c
}) =>
  n.createElement(
    "svg",
    {
      ...c,
      "aria-hidden": o,
      role: o ? void 0 : "img",
      width: typeof e == "number" ? `${e}px` : e,
      height: typeof e == "number" ? `${e}px` : e,
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      style: { color: l, ...a },
    },
    t && !o && n.createElement("title", null, t),
    r,
  );
var i = (r) =>
    s.createElement(
      p,
      { ...r, ariaLabel: "full-screen, focus" },
      s.createElement("path", {
        d: "M8.25 3.75H6.75C5.09315 3.75 3.75 5.09315 3.75 6.75V8.25M15.75 3.75H17.25C18.9069 3.75 20.25 5.09315 20.25 6.75V8.25M20.25 15.75V17.25C20.25 18.9069 18.9069 20.25 17.25 20.25H15.75M8.25 20.25H6.75C5.09315 20.25 3.75 18.9069 3.75 17.25V15.75",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
    ),
  d = i;
export { i as IconFullScreen, d as default };
