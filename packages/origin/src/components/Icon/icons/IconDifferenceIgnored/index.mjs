import t from "react";
import p from "react";
var s = ({
  children: r,
  size: e = 24,
  ariaLabel: n,
  color: a,
  ariaHidden: o = !0,
  style: l,
  ...i
}) =>
  p.createElement(
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
    n && !o && p.createElement("title", null, n),
    r,
  );
var c = (r) =>
    t.createElement(
      s,
      { ...r, ariaLabel: "difference-ignored" },
      t.createElement("path", {
        d: "M17.25 3.75H6.75C5.09315 3.75 3.75 5.09315 3.75 6.75V17.25C3.75 18.9069 5.09315 20.25 6.75 20.25H17.25C18.9069 20.25 20.25 18.9069 20.25 17.25V6.75C20.25 5.09315 18.9069 3.75 17.25 3.75Z",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinejoin: "round",
      }),
      t.createElement("path", {
        d: "M8.75 15.25L15.25 8.75",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
      }),
    ),
  u = c;
export { c as IconDifferenceIgnored, u as default };
