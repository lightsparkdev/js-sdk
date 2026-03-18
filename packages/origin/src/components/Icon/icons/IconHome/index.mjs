import p from "react";
import n from "react";
var C = ({
  children: o,
  size: e = 24,
  ariaLabel: t,
  color: s,
  ariaHidden: r = !0,
  style: a,
  ...l
}) =>
  n.createElement(
    "svg",
    {
      ...l,
      "aria-hidden": r,
      role: r ? void 0 : "img",
      width: typeof e == "number" ? `${e}px` : e,
      height: typeof e == "number" ? `${e}px` : e,
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      style: { color: s, ...a },
    },
    t && !r && n.createElement("title", null, t),
    o,
  );
var m = (o) =>
    p.createElement(
      C,
      { ...o, ariaLabel: "home, house" },
      p.createElement("path", {
        d: "M3.75 10.2746C3.75 9.43885 3.75 9.02098 3.85513 8.63438C3.94828 8.29187 4.10146 7.9686 4.30757 7.67962C4.54021 7.35344 4.86363 7.08883 5.51046 6.5596L8.96046 3.73687C10.0433 2.85087 10.5848 2.40787 11.1874 2.23831C11.7188 2.08878 12.2812 2.08878 12.8126 2.23831C13.4152 2.40787 13.9567 2.85087 15.0395 3.73687L18.4895 6.5596C19.1364 7.08883 19.4598 7.35344 19.6924 7.67962C19.8985 7.9686 20.0517 8.29187 20.1449 8.63438C20.25 9.02098 20.25 9.43885 20.25 10.2746V15.45C20.25 17.1301 20.25 17.9702 19.923 18.6119C19.6354 19.1764 19.1765 19.6354 18.612 19.923C17.9702 20.25 17.1302 20.25 15.45 20.25H8.55C6.86984 20.25 6.02976 20.25 5.38803 19.923C4.82354 19.6354 4.3646 19.1764 4.07698 18.6119C3.75 17.9702 3.75 17.1301 3.75 15.45V10.2746Z",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinejoin: "round",
      }),
    ),
  h = m;
export { m as IconHome, h as default };
