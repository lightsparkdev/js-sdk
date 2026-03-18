import r from "react";
import s from "react";
var i = ({
  children: e,
  size: o = 24,
  ariaLabel: n,
  color: p,
  ariaHidden: t = !0,
  style: a,
  ...d
}) =>
  s.createElement(
    "svg",
    {
      ...d,
      "aria-hidden": t,
      role: t ? void 0 : "img",
      width: typeof o == "number" ? `${o}px` : o,
      height: typeof o == "number" ? `${o}px` : o,
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      style: { color: p, ...a },
    },
    n && !t && s.createElement("title", null, n),
    e,
  );
var u = (e) =>
    r.createElement(
      i,
      { ...e, ariaLabel: "remix, new-try, repeat" },
      r.createElement("path", {
        d: "M3.75 13V7.75C3.75 6.09315 5.09315 4.75 6.75 4.75H19.5",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
      r.createElement("path", {
        d: "M17.5 2L20.25 4.74979L17.5 7.5",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
      r.createElement("path", {
        d: "M6.5 22L3.75 19.2501L6.5 16.5",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
      r.createElement("path", {
        d: "M4.5 19.25H17.25C18.9069 19.25 20.25 17.9069 20.25 16.25V11",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
      r.createElement("path", {
        d: "M12 8.75V15.25",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
      r.createElement("path", {
        d: "M8.74023 12H15.25",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
    ),
  C = u;
export { u as IconRemix, C as default };
