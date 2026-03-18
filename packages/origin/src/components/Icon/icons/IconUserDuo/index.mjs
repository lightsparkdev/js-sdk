import o from "react";
import s from "react";
var i = ({
  children: e,
  size: r = 24,
  ariaLabel: n,
  color: p,
  ariaHidden: t = !0,
  style: a,
  ...c
}) =>
  s.createElement(
    "svg",
    {
      ...c,
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
      { ...e, ariaLabel: "user-duo, team, members, persons" },
      o.createElement("path", {
        d: "M4.75 19.25C3.09315 19.25 1.67671 17.8733 2.16196 16.2891C2.86531 13.9928 4.51906 12.25 7.5 12.25C10.4809 12.25 12.1347 13.9928 12.838 16.2891C13.3233 17.8733 11.9069 19.25 10.25 19.25H4.75Z",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
      o.createElement("path", {
        d: "M16.75 18.25H19.25C20.9069 18.25 22.3599 16.8654 21.852 15.2884C21.249 13.4161 19.9142 12.25 17.5357 12.25",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
      o.createElement("circle", {
        cx: "7.5",
        cy: "8.5",
        r: "3.75",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
      o.createElement("circle", {
        cx: "17.5",
        cy: "9.5",
        r: "2.75",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
    ),
  k = l;
export { l as IconUserDuo, k as default };
