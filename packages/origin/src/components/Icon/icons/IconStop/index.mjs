import s from "react";
import n from "react";
var p = ({
  children: t,
  size: r = 24,
  ariaLabel: o,
  color: a,
  ariaHidden: e = !0,
  style: C,
  ...l
}) =>
  n.createElement(
    "svg",
    {
      ...l,
      "aria-hidden": e,
      role: e ? void 0 : "img",
      width: typeof r == "number" ? `${r}px` : r,
      height: typeof r == "number" ? `${r}px` : r,
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      style: { color: a, ...C },
    },
    o && !e && n.createElement("title", null, o),
    t,
  );
var i = (t) =>
    s.createElement(
      p,
      { ...t, ariaLabel: "stop" },
      s.createElement("path", {
        d: "M20.25 15.45V8.55C20.25 6.86984 20.25 6.02976 19.923 5.38803C19.6354 4.82354 19.1765 4.3646 18.612 4.07698C17.9702 3.75 17.1302 3.75 15.45 3.75H8.55C6.86984 3.75 6.02976 3.75 5.38803 4.07698C4.82354 4.3646 4.3646 4.82354 4.07698 5.38803C3.75 6.02976 3.75 6.86984 3.75 8.55V15.45C3.75 17.1302 3.75 17.9702 4.07698 18.612C4.3646 19.1765 4.82354 19.6354 5.38803 19.923C6.02976 20.25 6.86984 20.25 8.55 20.25H15.45C17.1302 20.25 17.9702 20.25 18.612 19.923C19.1765 19.6354 19.6354 19.1765 19.923 18.612C20.25 17.9702 20.25 17.1302 20.25 15.45Z",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
    ),
  d = i;
export { i as IconStop, d as default };
