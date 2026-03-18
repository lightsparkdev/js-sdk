import t from "react";
import s from "react";
var p = ({
  children: o,
  size: e = 24,
  ariaLabel: n,
  color: a,
  ariaHidden: r = !0,
  style: l,
  ...i
}) =>
  s.createElement(
    "svg",
    {
      ...i,
      "aria-hidden": r,
      role: r ? void 0 : "img",
      width: typeof e == "number" ? `${e}px` : e,
      height: typeof e == "number" ? `${e}px` : e,
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      style: { color: a, ...l },
    },
    n && !r && s.createElement("title", null, n),
    o,
  );
var C = (o) =>
    t.createElement(
      p,
      { ...o, ariaLabel: "eye-open, show, see, reveal, look, visible" },
      t.createElement("path", {
        d: "M21.2742 10.685C16.4537 2.77174 7.54646 2.77164 2.72595 10.6849C2.23523 11.4904 2.23523 12.5094 2.72595 13.3149C7.54646 21.2282 16.4537 21.2283 21.2742 13.3151C21.7649 12.5095 21.7649 11.4905 21.2742 10.685Z",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
      t.createElement("path", {
        d: "M15.25 12C15.25 13.7949 13.7949 15.25 12 15.25C10.2051 15.25 8.75 13.7949 8.75 12C8.75 10.2051 10.2051 8.75 12 8.75C13.7949 8.75 15.25 10.2051 15.25 12Z",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
    ),
  h = C;
export { C as IconEyeOpen, h as default };
