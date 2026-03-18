import o from "react";
import p from "react";
var s = ({
  children: e,
  size: r = 24,
  ariaLabel: n,
  color: a,
  ariaHidden: t = !0,
  style: i,
  ...l
}) =>
  p.createElement(
    "svg",
    {
      ...l,
      "aria-hidden": t,
      role: t ? void 0 : "img",
      width: typeof r == "number" ? `${r}px` : r,
      height: typeof r == "number" ? `${r}px` : r,
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      style: { color: a, ...i },
    },
    n && !t && p.createElement("title", null, n),
    e,
  );
var d = (e) =>
    o.createElement(
      s,
      { ...e, ariaLabel: "people-add, user-add" },
      o.createElement("path", {
        d: "M15.75 6.5C15.75 8.57107 14.0711 10.25 12 10.25C9.92893 10.25 8.25 8.57107 8.25 6.5C8.25 4.42893 9.92893 2.75 12 2.75C14.0711 2.75 15.75 4.42893 15.75 6.5Z",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
      o.createElement("path", {
        d: "M14.9997 13.838C14.1003 13.4592 13.0925 13.25 11.9997 13.25C9.02123 13.25 6.67402 14.8039 5.43304 17.1121C4.59593 18.6691 6.02717 20.25 7.79494 20.25H12.2497",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
      o.createElement("path", {
        d: "M18.25 15.25V18.25M18.25 18.25V21.25M18.25 18.25H15.25M18.25 18.25H21.25",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
    ),
  k = d;
export { d as IconPeopleAdd, k as default };
