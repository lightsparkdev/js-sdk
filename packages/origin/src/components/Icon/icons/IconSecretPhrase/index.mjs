import r from "react";
import s from "react";
var i = ({
  children: e,
  size: o = 24,
  ariaLabel: n,
  color: p,
  ariaHidden: t = !0,
  style: d,
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
      style: { color: p, ...d },
    },
    n && !t && s.createElement("title", null, n),
    e,
  );
var u = (e) =>
    r.createElement(
      i,
      { ...e, ariaLabel: "secret-phrase, code, private-phrase" },
      r.createElement("path", {
        d: "M18.25 4.75H5.75C4.09315 4.75 2.75 6.09315 2.75 7.75V16.25C2.75 17.9069 4.09315 19.25 5.75 19.25H18.25C19.9069 19.25 21.25 17.9069 21.25 16.25V7.75C21.25 6.09315 19.9069 4.75 18.25 4.75Z",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
      r.createElement("path", {
        d: "M6.75 8.75H10.25",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
      r.createElement("path", {
        d: "M13.75 8.75H17.25",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
      r.createElement("path", {
        d: "M6.75 12H10.25",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
      r.createElement("path", {
        d: "M13.75 12H17.25",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
      r.createElement("path", {
        d: "M6.75 15.25H10.25",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
      r.createElement("path", {
        d: "M13.75 15.25H17.25",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
    ),
  C = u;
export { u as IconSecretPhrase, C as default };
