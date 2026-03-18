import o from "react";
import s from "react";
var a = ({
  children: r,
  size: e = 24,
  ariaLabel: n,
  color: p,
  ariaHidden: t = !0,
  style: C,
  ...l
}) =>
  s.createElement(
    "svg",
    {
      ...l,
      "aria-hidden": t,
      role: t ? void 0 : "img",
      width: typeof e == "number" ? `${e}px` : e,
      height: typeof e == "number" ? `${e}px` : e,
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      style: { color: p, ...C },
    },
    n && !t && s.createElement("title", null, n),
    r,
  );
var i = (r) =>
    o.createElement(
      a,
      { ...r, ariaLabel: "settings-gear-1, preferences" },
      o.createElement("path", {
        d: "M18.7469 6.63455L13.4969 3.61186C12.5703 3.07836 11.4297 3.07836 10.5031 3.61185L5.25313 6.63453C4.32316 7.16995 3.75 8.16132 3.75 9.23441V14.7658C3.75 15.8389 4.32319 16.8303 5.25319 17.3657L10.5031 20.3881C11.4297 20.9216 12.5702 20.9216 13.4968 20.3881L18.7469 17.3654C19.6769 16.83 20.25 15.8386 20.25 14.7655V9.23443C20.25 8.16135 19.6769 7.16998 18.7469 6.63455Z",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "square",
      }),
      o.createElement("path", {
        d: "M15.25 12C15.25 13.7949 13.7949 15.25 12 15.25C10.2051 15.25 8.75 13.7949 8.75 12C8.75 10.2051 10.2051 8.75 12 8.75C13.7949 8.75 15.25 10.2051 15.25 12Z",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "square",
      }),
    ),
  f = i;
export { i as IconSettingsGear1, f as default };
