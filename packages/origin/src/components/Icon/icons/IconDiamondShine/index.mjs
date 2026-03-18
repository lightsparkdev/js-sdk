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
var l = (e) =>
    r.createElement(
      i,
      { ...e, ariaLabel: "diamond-shine, pop, polish" },
      r.createElement("path", {
        d: "M16.8423 8.37249C16.4647 7.97504 15.9406 7.75 15.3923 7.75H8.60958C8.06135 7.75 7.53716 7.97505 7.15957 8.37251L4.3078 11.3744C3.57522 12.1456 3.57438 13.3552 4.3059 14.1274L10.549 20.7174C11.3378 21.5501 12.6639 21.5501 13.4528 20.7174L19.6961 14.1274C20.4276 13.3552 20.4268 12.1456 19.6942 11.3744L16.8423 8.37249Z",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
      r.createElement("path", {
        d: "M4.5 12.75H19.5",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
      r.createElement("path", {
        d: "M12 2.75V4.25",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
      r.createElement("path", {
        d: "M20.5 4.5L19.5 5.5",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
      r.createElement("path", {
        d: "M3.5 4.5L4.5 5.5",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
    ),
  c = l;
export { l as IconDiamondShine, c as default };
