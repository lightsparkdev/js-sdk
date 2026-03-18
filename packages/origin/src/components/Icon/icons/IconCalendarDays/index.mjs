import e from "react";
import n from "react";
var C = ({
  children: o,
  size: r = 24,
  ariaLabel: t,
  color: d,
  ariaHidden: l = !0,
  style: p,
  ...a
}) =>
  n.createElement(
    "svg",
    {
      ...a,
      "aria-hidden": l,
      role: l ? void 0 : "img",
      width: typeof r == "number" ? `${r}px` : r,
      height: typeof r == "number" ? `${r}px` : r,
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      style: { color: d, ...p },
    },
    t && !l && n.createElement("title", null, t),
    o,
  );
var i = (o) =>
    e.createElement(
      C,
      { ...o, ariaLabel: "calendar-days" },
      e.createElement("path", {
        d: "M6.75 3.75H17.25C18.9069 3.75 20.25 5.09315 20.25 6.75V7.75V17.25C20.25 18.9069 18.9069 20.25 17.25 20.25H6.75C5.09315 20.25 3.75 18.9069 3.75 17.25V7.75V6.75C3.75 5.09315 5.09315 3.75 6.75 3.75Z",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "square",
      }),
      e.createElement("path", {
        d: "M3.75 7.75H20.25",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "square",
      }),
      e.createElement("path", {
        fillRule: "evenodd",
        clipRule: "evenodd",
        d: "M8 11C8.55228 11 9 11.4477 9 12C9 12.5523 8.55228 13 8 13C7.44772 13 7 12.5523 7 12C7 11.4477 7.44772 11 8 11Z",
        fill: "currentColor",
      }),
      e.createElement("path", {
        fillRule: "evenodd",
        clipRule: "evenodd",
        d: "M8 15C8.55228 15 9 15.4477 9 16C9 16.5523 8.55228 17 8 17C7.44772 17 7 16.5523 7 16C7 15.4477 7.44772 15 8 15Z",
        fill: "currentColor",
      }),
      e.createElement("path", {
        fillRule: "evenodd",
        clipRule: "evenodd",
        d: "M12 11C12.5523 11 13 11.4477 13 12C13 12.5523 12.5523 13 12 13C11.4477 13 11 12.5523 11 12C11 11.4477 11.4477 11 12 11Z",
        fill: "currentColor",
      }),
      e.createElement("path", {
        fillRule: "evenodd",
        clipRule: "evenodd",
        d: "M12 15C12.5523 15 13 15.4477 13 16C13 16.5523 12.5523 17 12 17C11.4477 17 11 16.5523 11 16C11 15.4477 11.4477 15 12 15Z",
        fill: "currentColor",
      }),
      e.createElement("path", {
        fillRule: "evenodd",
        clipRule: "evenodd",
        d: "M16 11C16.5523 11 17 11.4477 17 12C17 12.5523 16.5523 13 16 13C15.4477 13 15 12.5523 15 12C15 11.4477 15.4477 11 16 11Z",
        fill: "currentColor",
      }),
    ),
  h = i;
export { i as IconCalendarDays, h as default };
