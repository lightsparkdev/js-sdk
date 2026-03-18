import t from "react";
import p from "react";
var s = ({
  children: o,
  size: r = 24,
  ariaLabel: n,
  color: a,
  ariaHidden: e = !0,
  style: l,
  ...i
}) =>
  p.createElement(
    "svg",
    {
      ...i,
      "aria-hidden": e,
      role: e ? void 0 : "img",
      width: typeof r == "number" ? `${r}px` : r,
      height: typeof r == "number" ? `${r}px` : r,
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      style: { color: a, ...l },
    },
    n && !e && p.createElement("title", null, n),
    o,
  );
var C = (o) =>
    t.createElement(
      s,
      { ...o, ariaLabel: "lock, private" },
      t.createElement("path", {
        d: "M7.75 9.75H16.25M7.75 9.75C6.09315 9.75 4.75 11.0931 4.75 12.75V18.25C4.75 19.9069 6.09315 21.25 7.75 21.25H16.25C17.9069 21.25 19.25 19.9069 19.25 18.25V12.75C19.25 11.0931 17.9069 9.75 16.25 9.75M7.75 9.75V7.25C7.75 4.90279 9.65279 3 12 3C14.3472 3 16.25 4.90279 16.25 7.25V9.75",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
      t.createElement("path", {
        d: "M12 14V17",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
    ),
  k = C;
export { C as IconLock, k as default };
