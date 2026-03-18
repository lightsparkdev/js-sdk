import l from "react";
import n from "react";
var a = ({
  children: e,
  size: r = 24,
  ariaLabel: o,
  color: p,
  ariaHidden: t = !0,
  style: s,
  ...i
}) =>
  n.createElement(
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
      style: { color: p, ...s },
    },
    o && !t && n.createElement("title", null, o),
    e,
  );
var C = (e) =>
    l.createElement(
      a,
      { ...e, ariaLabel: "exclamation-triangle, error, warning, alert" },
      l.createElement("path", {
        d: "M12 8.74986V12.7499M12 15.4999V15.4899M9.44847 4.37571L3.08105 14.672C1.84507 16.6706 3.28264 19.2499 5.63256 19.2499H18.3674C20.7173 19.2499 22.1549 16.6706 20.9189 14.672L14.5515 4.3757C13.3789 2.47958 10.6211 2.47958 9.44847 4.37571ZM12.25 15.4999C12.25 15.6379 12.1381 15.7499 12 15.7499C11.8619 15.7499 11.75 15.6379 11.75 15.4999C11.75 15.3618 11.8619 15.2499 12 15.2499C12.1381 15.2499 12.25 15.3618 12.25 15.4999Z",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
      }),
    ),
  x = C;
export { C as IconExclamationTriangle, x as default };
