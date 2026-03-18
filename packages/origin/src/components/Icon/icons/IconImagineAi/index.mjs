import r from "react";
import s from "react";
var i = ({
  children: e,
  size: o = 24,
  ariaLabel: n,
  color: p,
  ariaHidden: t = !0,
  style: C,
  ...a
}) =>
  s.createElement(
    "svg",
    {
      ...a,
      "aria-hidden": t,
      role: t ? void 0 : "img",
      width: typeof o == "number" ? `${o}px` : o,
      height: typeof o == "number" ? `${o}px` : o,
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      style: { color: p, ...C },
    },
    n && !t && s.createElement("title", null, n),
    e,
  );
var d = (e) =>
    r.createElement(
      i,
      { ...e, ariaLabel: "imagine-ai, cube, room, 3d, opject, vector" },
      r.createElement("path", {
        d: "M20.5 14.3108V14.9932C20.5 16.0782 19.9142 17.0787 18.9679 17.6096L18.375 17.9422",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
      r.createElement("path", {
        d: "M3.5 14.3108V14.9933C3.5 16.0782 4.08583 17.0787 5.03206 17.6096L5.62498 17.9422",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
      r.createElement("path", {
        d: "M9.875 3.6859L10.538 3.31589C11.4467 2.80878 12.5533 2.80878 13.462 3.31589L14.125 3.6859",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
      r.createElement("path", {
        d: "M18.375 6.05774L18.9679 6.39042C19.9142 6.92131 20.5 7.92175 20.5 9.00674V9.6892",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
      r.createElement("path", {
        d: "M14.125 20.3141L13.462 20.6841C12.5533 21.1912 11.4467 21.1912 10.538 20.6841L9.875 20.3141",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
      r.createElement("path", {
        d: "M5.62498 6.05774L5.03205 6.39042C4.08583 6.92132 3.5 7.92175 3.5 9.00674V9.6892",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
      r.createElement("path", {
        d: "M13.133 9.27582L12.6115 7.92001C12.5142 7.66697 12.2711 7.5 12 7.5C11.7289 7.5 11.4858 7.66697 11.3885 7.92001L10.867 9.27582C10.5856 10.0074 10.0074 10.5856 9.27582 10.867L7.92001 11.3885C7.66697 11.4858 7.5 11.7289 7.5 12C7.5 12.2711 7.66697 12.5142 7.92001 12.6115L9.27582 13.133C10.0074 13.4144 10.5856 13.9926 10.867 14.7242L11.3885 16.08C11.4858 16.333 11.7289 16.5 12 16.5C12.2711 16.5 12.5142 16.333 12.6115 16.08L13.133 14.7242C13.4144 13.9926 13.9926 13.4144 14.7242 13.133L16.08 12.6115C16.333 12.5142 16.5 12.2711 16.5 12C16.5 11.7289 16.333 11.4858 16.08 11.3885L14.7242 10.867C13.9926 10.5856 13.4144 10.0074 13.133 9.27582Z",
        fill: "currentColor",
      }),
    ),
  c = d;
export { d as IconImagineAi, c as default };
