import o from "react";
import l from "react";
var p = ({
  children: e,
  size: r = 24,
  ariaLabel: n,
  color: C,
  ariaHidden: t = !0,
  style: a,
  ...s
}) =>
  l.createElement(
    "svg",
    {
      ...s,
      "aria-hidden": t,
      role: t ? void 0 : "img",
      width: typeof r == "number" ? `${r}px` : r,
      height: typeof r == "number" ? `${r}px` : r,
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      style: { color: C, ...a },
    },
    n && !t && l.createElement("title", null, n),
    e,
  );
var i = (e) =>
    o.createElement(
      p,
      {
        ...e,
        ariaLabel: "clipboard 2-sparkle, copy, list, auto-fill, form-fill",
      },
      o.createElement("path", {
        d: "M7.75 5.75C7.75 4.09315 9.09315 2.75 10.75 2.75H13.25C14.9069 2.75 16.25 4.09315 16.25 5.75V6.25C16.25 6.80228 15.8023 7.25 15.25 7.25H8.75C8.19772 7.25 7.75 6.80228 7.75 6.25V5.75Z",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "square",
        strokeLinejoin: "round",
      }),
      o.createElement("path", {
        d: "M19.2405 16.1852L18.5436 14.3733C18.4571 14.1484 18.241 14 18 14C17.759 14 17.5429 14.1484 17.4564 14.3733L16.7595 16.1852C16.658 16.4493 16.4493 16.658 16.1852 16.7595L14.3733 17.4564C14.1484 17.5429 14 17.759 14 18C14 18.241 14.1484 18.4571 14.3733 18.5436L16.1852 19.2405C16.4493 19.342 16.658 19.5507 16.7595 19.8148L17.4564 21.6267C17.5429 21.8516 17.759 22 18 22C18.241 22 18.4571 21.8516 18.5436 21.6267L19.2405 19.8148C19.342 19.5507 19.5507 19.342 19.8148 19.2405L21.6267 18.5436C21.8516 18.4571 22 18.241 22 18C22 17.759 21.8516 17.5429 21.6267 17.4564L19.8148 16.7595C19.5507 16.658 19.342 16.4493 19.2405 16.1852Z",
        fill: "currentColor",
      }),
      o.createElement("path", {
        d: "M16.25 4.75H17.25C18.9069 4.75 20.25 6.09315 20.25 7.75V11.75M7.75 4.75H6.75C5.09315 4.75 3.75 6.09315 3.75 7.75V18.25C3.75 19.9069 5.09315 21.25 6.75 21.25H13.25",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
    ),
  f = i;
export { i as IconClipboard2Sparkle, f as default };
