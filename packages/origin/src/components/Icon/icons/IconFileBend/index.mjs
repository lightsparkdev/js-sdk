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
var C = (r) =>
    t.createElement(
      s,
      { ...r, ariaLabel: "file-bend, document" },
      t.createElement("path", {
        d: "M11.9216 2.75H7.75C6.09315 2.75 4.75 4.09315 4.75 5.75V18.25C4.75 19.9069 6.09315 21.25 7.75 21.25H16.25C17.9069 21.25 19.25 19.9069 19.25 18.25V10.0784C19.25 9.54799 19.0393 9.03929 18.6642 8.66421L13.3358 3.33579C12.9607 2.96071 12.452 2.75 11.9216 2.75Z",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
      t.createElement("path", {
        d: "M12.75 3.25V7.25C12.75 8.35457 13.6454 9.25 14.75 9.25H18.75",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinejoin: "round",
      }),
    ),
  f = C;
export { C as IconFileBend, f as default };
