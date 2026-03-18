import o from "react";
import p from "react";
var s = ({
  children: e,
  size: r = 24,
  ariaLabel: n,
  color: a,
  ariaHidden: t = !0,
  style: l,
  ...i
}) =>
  p.createElement(
    "svg",
    {
      ...i,
      "aria-hidden": t,
      role: t ? void 0 : "img",
      width: typeof r == "number" ? `${r}px` : r,
      height: typeof r == "number" ? `${r}px` : r,
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      style: { color: a, ...l },
    },
    n && !t && p.createElement("title", null, n),
    e,
  );
var c = (e) =>
    o.createElement(
      s,
      { ...e, ariaLabel: "pencil-2, edit, write, prompt" },
      o.createElement("path", {
        d: "M15.0294 3.82353L4.95922 13.8937C4.51709 14.3359 4.22415 14.9051 4.12136 15.5218L3.25 20.75L8.47816 19.8786C9.09492 19.7758 9.66415 19.4829 10.1063 19.0408L20.1765 8.97059C21.5978 7.54927 21.5978 5.24485 20.1765 3.82353C18.7552 2.40221 16.4507 2.40221 15.0294 3.82353Z",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
      o.createElement("path", {
        d: "M14 5L19 10",
        stroke: "currentColor",
        strokeWidth: "1.5",
      }),
    ),
  f = c;
export { c as IconPencil2, f as default };
