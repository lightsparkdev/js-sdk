import r from "react";
import p from "react";
var s = ({
  children: t,
  size: o = 24,
  ariaLabel: n,
  color: a,
  ariaHidden: e = !0,
  style: l,
  ...C
}) =>
  p.createElement(
    "svg",
    {
      ...C,
      "aria-hidden": e,
      role: e ? void 0 : "img",
      width: typeof o == "number" ? `${o}px` : o,
      height: typeof o == "number" ? `${o}px` : o,
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      style: { color: a, ...l },
    },
    n && !e && p.createElement("title", null, n),
    t,
  );
var i = (t) =>
    r.createElement(
      s,
      { ...t, ariaLabel: "voice-sparkle, ai, sound" },
      r.createElement("path", {
        d: "M7.75 3.75V20.25",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
      }),
      r.createElement("path", {
        d: "M3.75 9.75V14.25",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
      }),
      r.createElement("path", {
        d: "M12 7.75V13.75",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
      }),
      r.createElement("path", {
        d: "M16.25 5.75V10.75",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
      }),
      r.createElement("path", {
        d: "M20.25 9.75V13.75",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
      }),
      r.createElement("path", {
        d: "M17.2405 15.1852L16.5436 13.3733C16.4571 13.1484 16.241 13 16 13C15.759 13 15.5429 13.1484 15.4564 13.3733L14.7595 15.1852C14.658 15.4493 14.4493 15.658 14.1852 15.7595L12.3733 16.4564C12.1484 16.5429 12 16.759 12 17C12 17.241 12.1484 17.4571 12.3733 17.5436L14.1852 18.2405C14.4493 18.342 14.658 18.5507 14.7595 18.8148L15.4564 20.6267C15.5429 20.8516 15.759 21 16 21C16.241 21 16.4571 20.8516 16.5436 20.6267L17.2405 18.8148C17.342 18.5507 17.5507 18.342 17.8148 18.2405L19.6267 17.5436C19.8516 17.4571 20 17.241 20 17C20 16.759 19.8516 16.5429 19.6267 16.4564L17.8148 15.7595C17.5507 15.658 17.342 15.4493 17.2405 15.1852Z",
        fill: "currentColor",
      }),
    ),
  h = i;
export { i as IconVoiceSparkle, h as default };
