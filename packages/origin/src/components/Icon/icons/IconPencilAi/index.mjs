import t from "react";
import p from "react";
var C = ({
  children: o,
  size: r = 24,
  ariaLabel: n,
  color: s,
  ariaHidden: e = !0,
  style: a,
  ...i
}) =>
  p.createElement(
    "svg",
    {
      ...i,
      "aria-hidden": e,
      role: e ? void 0 : "img",
      width: typeof r == "number" ? `${r}px` : r,
      height: typeof r == "number" ? `${r}px` : r,
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      style: { color: s, ...a },
    },
    n && !e && p.createElement("title", null, n),
    o,
  );
var l = (o) =>
    t.createElement(
      C,
      {
        ...o,
        ariaLabel:
          "pencil-ai, edit, write, auto-write, prompt-suggestion, auto-prompt",
      },
      t.createElement("path", {
        d: "M16.0294 4.82353L5.95922 14.8937C5.51709 15.3359 5.22415 15.9051 5.12136 16.5218L4.25 21.75L9.47816 20.8786C10.0949 20.7758 10.6641 20.4829 11.1063 20.0408L21.1765 9.97059C22.5978 8.54927 22.5978 6.24485 21.1765 4.82353C19.7552 3.40221 17.4507 3.40221 16.0294 4.82353Z",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
      t.createElement("path", {
        d: "M15 6L20 11",
        stroke: "currentColor",
        strokeWidth: "1.5",
      }),
      t.createElement("path", {
        d: "M7.24045 4.18518L6.54359 2.37334C6.45708 2.14842 6.24099 2 6 2C5.75901 2 5.54292 2.14842 5.45641 2.37334L4.75955 4.18518C4.65797 4.44927 4.44927 4.65797 4.18518 4.75955L2.37334 5.45641C2.14842 5.54292 2 5.75901 2 6C2 6.24099 2.14842 6.45708 2.37334 6.54359L4.18518 7.24045C4.44927 7.34203 4.65797 7.55073 4.75955 7.81482L5.45641 9.62666C5.54292 9.85158 5.75901 10 6 10C6.24099 10 6.45708 9.85158 6.54359 9.62666L7.24045 7.81482C7.34203 7.55073 7.55073 7.34203 7.81482 7.24045L9.62666 6.54359C9.85158 6.45708 10 6.24099 10 6C10 5.75901 9.85158 5.54292 9.62666 5.45641L7.81482 4.75955C7.55073 4.65797 7.34203 4.44927 7.24045 4.18518Z",
        fill: "currentColor",
      }),
    ),
  d = l;
export { l as IconPencilAi, d as default };
