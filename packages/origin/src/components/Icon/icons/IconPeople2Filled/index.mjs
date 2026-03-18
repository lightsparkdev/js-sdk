import t from "react";
import l from "react";
var p = ({
  children: o,
  size: e = 24,
  ariaLabel: n,
  color: a,
  ariaHidden: r = !0,
  style: C,
  ...s
}) =>
  l.createElement(
    "svg",
    {
      ...s,
      "aria-hidden": r,
      role: r ? void 0 : "img",
      width: typeof e == "number" ? `${e}px` : e,
      height: typeof e == "number" ? `${e}px` : e,
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      style: { color: a, ...C },
    },
    n && !r && l.createElement("title", null, n),
    o,
  );
var i = (o) =>
    t.createElement(
      p,
      { ...o, ariaLabel: "people-2" },
      t.createElement("path", {
        fillRule: "evenodd",
        clipRule: "evenodd",
        d: "M6.5 7.5C6.5 4.46243 8.96243 2 12 2C15.0376 2 17.5 4.46243 17.5 7.5C17.5 10.5376 15.0376 13 12 13C8.96243 13 6.5 10.5376 6.5 7.5Z",
        fill: "currentColor",
      }),
      t.createElement("path", {
        fillRule: "evenodd",
        clipRule: "evenodd",
        d: "M3.74416 21C3.32995 21 3 20.6642 3 20.25V18.75C3 16.1266 5.12665 14 7.75 14H16.25C18.8734 14 21 16.1266 21 18.75V20.25C21 20.6642 20.67 21 20.2558 21C17.0815 21 6.91849 21 3.74416 21Z",
        fill: "currentColor",
      }),
    ),
  f = i;
export { i as IconPeople2, f as default };
