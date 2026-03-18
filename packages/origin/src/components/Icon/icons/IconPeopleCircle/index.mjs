import t from "react";
import p from "react";
var l = ({
  children: e,
  size: r = 24,
  ariaLabel: n,
  color: s,
  ariaHidden: o = !0,
  style: a,
  ...C
}) =>
  p.createElement(
    "svg",
    {
      ...C,
      "aria-hidden": o,
      role: o ? void 0 : "img",
      width: typeof r == "number" ? `${r}px` : r,
      height: typeof r == "number" ? `${r}px` : r,
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      style: { color: s, ...a },
    },
    n && !o && p.createElement("title", null, n),
    e,
  );
var i = (e) =>
    t.createElement(
      l,
      { ...e, ariaLabel: "people-circle, user-circle,avatar,profile" },
      t.createElement("path", {
        d: "M15.25 10C15.25 11.7949 13.7949 13.25 12 13.25C10.2051 13.25 8.75 11.7949 8.75 10C8.75 8.20507 10.2051 6.75 12 6.75C13.7949 6.75 15.25 8.20507 15.25 10Z",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinejoin: "round",
      }),
      t.createElement("path", {
        d: "M18.143 18.9157C16.8294 16.9968 14.668 15.75 12 15.75C9.33203 15.75 7.17056 16.9968 5.85697 18.9157M18.143 18.9157C20.0491 17.2214 21.25 14.7509 21.25 12C21.25 6.89137 17.1086 2.75 12 2.75C6.89137 2.75 2.75 6.89137 2.75 12C2.75 14.7509 3.95086 17.2214 5.85697 18.9157M18.143 18.9157C16.5094 20.3679 14.3577 21.25 12 21.25C9.6423 21.25 7.49061 20.3679 5.85697 18.9157",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinejoin: "round",
      }),
    ),
  f = i;
export { i as IconPeopleCircle, f as default };
