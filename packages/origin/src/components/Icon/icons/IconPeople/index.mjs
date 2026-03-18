import t from "react";
import p from "react";
var s = ({
  children: e,
  size: r = 24,
  ariaLabel: n,
  color: a,
  ariaHidden: o = !0,
  style: l,
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
      style: { color: a, ...l },
    },
    n && !o && p.createElement("title", null, n),
    e,
  );
var i = (e) =>
    t.createElement(
      s,
      { ...e, ariaLabel: "people, user, person, avatar" },
      t.createElement("path", {
        d: "M15.75 6.5C15.75 8.57107 14.0711 10.25 12 10.25C9.92893 10.25 8.25 8.57107 8.25 6.5C8.25 4.42893 9.92893 2.75 12 2.75C14.0711 2.75 15.75 4.42893 15.75 6.5Z",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinejoin: "round",
      }),
      t.createElement("path", {
        d: "M11.9997 13.25C9.02123 13.25 6.67402 14.8039 5.43304 17.1121C4.59593 18.6691 6.02717 20.25 7.79494 20.25H16.2044C17.9722 20.25 19.4034 18.6691 18.5663 17.1121C17.3254 14.8039 14.9781 13.25 11.9997 13.25Z",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinejoin: "round",
      }),
    ),
  f = i;
export { i as IconPeople, f as default };
