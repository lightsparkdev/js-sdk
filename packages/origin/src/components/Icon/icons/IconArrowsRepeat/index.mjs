import o from "react";
import s from "react";
var p = ({
  children: e,
  size: r = 24,
  ariaLabel: n,
  color: a,
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
      style: { color: a, ...i },
    },
    n && !t && s.createElement("title", null, n),
    e,
  );
var d = (e) =>
    o.createElement(
      p,
      { ...e, ariaLabel: "arrows-repeat, repost" },
      o.createElement("path", {
        d: "M3.75 13.25V7.75C3.75 6.09315 5.09315 4.75 6.75 4.75H15.1071",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
      o.createElement("path", {
        d: "M12.6455 1.75L15.7527 4.75L12.6455 7.75",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
      o.createElement("path", {
        d: "M20.2502 10.75V16.25C20.2502 17.9069 18.9071 19.25 17.2502 19.25H8.89307",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
      o.createElement("path", {
        d: "M11.3542 22.25L8.24707 19.25L11.3542 16.25",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
    ),
  m = d;
export { d as IconArrowsRepeat, m as default };
