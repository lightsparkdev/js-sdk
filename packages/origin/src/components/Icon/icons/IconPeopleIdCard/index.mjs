import e from "react";
import p from "react";
var s = ({
  children: o,
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
    o,
  );
var c = (o) =>
    e.createElement(
      s,
      {
        ...o,
        ariaLabel: "people-id-card, profile, user-account, badge, person",
      },
      e.createElement("path", {
        d: "M16.75 2.75H7.25C5.59315 2.75 4.25 4.09315 4.25 5.75V18.25C4.25 19.9069 5.59315 21.25 7.25 21.25H16.75C18.4069 21.25 19.75 19.9069 19.75 18.25V5.75C19.75 4.09315 18.4069 2.75 16.75 2.75Z",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
      e.createElement("circle", {
        cx: "12",
        cy: "12.25",
        r: "2.25",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
      }),
      e.createElement("path", {
        d: "M16 21C16 18.7909 14.2091 17 12 17C9.79086 17 8 18.7909 8 21",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
      }),
      e.createElement("path", {
        d: "M9.75 6.25H14.25",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
      }),
    ),
  k = c;
export { c as IconPeopleIdCard, k as default };
