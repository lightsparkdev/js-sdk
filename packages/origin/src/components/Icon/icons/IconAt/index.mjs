import p from "react";
import n from "react";
var a = ({
  children: e,
  size: t = 24,
  ariaLabel: o,
  color: s,
  ariaHidden: r = !0,
  style: l,
  ...C
}) =>
  n.createElement(
    "svg",
    {
      ...C,
      "aria-hidden": r,
      role: r ? void 0 : "img",
      width: typeof t == "number" ? `${t}px` : t,
      height: typeof t == "number" ? `${t}px` : t,
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      style: { color: s, ...l },
    },
    o && !r && n.createElement("title", null, o),
    e,
  );
var m = (e) =>
    p.createElement(
      a,
      { ...e, ariaLabel: "at, handle, @" },
      p.createElement("path", {
        d: "M16.8684 19.8667C15.4543 20.7437 13.7863 21.25 12 21.25C6.89137 21.25 2.75 17.1086 2.75 12C2.75 6.89137 6.89137 2.75 12 2.75C17.1086 2.75 21.25 6.89137 21.25 12C21.25 13.9797 20.2662 16.0242 17.9715 15.8156C16.0837 15.644 14.7249 13.9258 14.993 12.0492L15.5226 8.40278M14.9375 12.4805C14.63 14.6681 12.8291 16.2235 10.9149 15.9544C9.00068 15.6854 7.69817 13.6939 8.00562 11.5063C8.31308 9.31862 10.1141 7.76327 12.0283 8.03229C13.9424 8.30131 15.245 10.2928 14.9375 12.4805Z",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
      }),
    ),
  d = m;
export { m as IconAt, d as default };
