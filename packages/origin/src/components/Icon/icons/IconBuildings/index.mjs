import o from "react";
import s from "react";
var i = ({
  children: e,
  size: r = 24,
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
      width: typeof r == "number" ? `${r}px` : r,
      height: typeof r == "number" ? `${r}px` : r,
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      style: { color: p, ...a },
    },
    n && !t && s.createElement("title", null, n),
    e,
  );
var l = (e) =>
    o.createElement(
      i,
      { ...e, ariaLabel: "buildings, company, workspace" },
      o.createElement("path", {
        d: "M10.25 8.75H7.75",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
      o.createElement("path", {
        d: "M7.75 12.75H10.25",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
      o.createElement("path", {
        d: "M22.25 19.25H1.75",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
      o.createElement("path", {
        d: "M3.75 19.25V6.75C3.75 5.09315 5.09315 3.75 6.75 3.75H11.25C12.9069 3.75 14.25 5.09315 14.25 6.75V19.25",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
      o.createElement("path", {
        d: "M14.25 7.75H17.25C18.9069 7.75 20.25 9.09315 20.25 10.75V19.25",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
    ),
  h = l;
export { l as IconBuildings, h as default };
