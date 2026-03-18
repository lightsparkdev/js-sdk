import r from "react";
import s from "react";
var i = ({
  children: e,
  size: o = 24,
  ariaLabel: n,
  color: p,
  ariaHidden: t = !0,
  style: a,
  ...l
}) =>
  s.createElement(
    "svg",
    {
      ...l,
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
var C = (e) =>
    r.createElement(
      i,
      { ...e, ariaLabel: "eye-slash, hide, eye off, see, look, not visible" },
      r.createElement("path", {
        d: "M9.38159 5.13889C13.3878 3.93307 17.7647 5.53139 20.7882 9.93379C21.1633 10.4799 21.3509 10.753 21.4814 11.2848C21.57 11.6457 21.57 12.3543 21.4814 12.7152C21.3509 13.247 21.1633 13.52 20.7883 14.0661C20.4438 14.5678 20.0817 15.033 19.7046 15.4619",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
      r.createElement("path", {
        d: "M9.5 9.92322C9.03166 10.4864 8.75 11.2103 8.75 12C8.75 13.7949 10.2051 15.25 12 15.25C12.8035 15.25 13.5389 14.9584 14.1061 14.4753",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
      r.createElement("path", {
        d: "M6.22301 6.75C5.12982 7.56322 4.11098 8.62442 3.21183 9.93363C2.83668 10.4799 2.64911 10.753 2.51857 11.2848C2.42999 11.6457 2.43003 12.3545 2.51865 12.7154C2.64926 13.2472 2.83714 13.5207 3.2129 14.0677C6.8927 19.4243 12.5765 20.6283 17.1571 17.6795",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
      r.createElement("path", {
        d: "M2.75 2.75L21.25 21.25",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
    ),
  h = C;
export { C as IconEyeSlash, h as default };
