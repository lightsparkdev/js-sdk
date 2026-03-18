import r from "react";
import l from "react";
var p = ({
  children: t,
  size: o = 24,
  ariaLabel: n,
  color: s,
  ariaHidden: e = !0,
  style: i,
  ...a
}) =>
  l.createElement(
    "svg",
    {
      ...a,
      "aria-hidden": e,
      role: e ? void 0 : "img",
      width: typeof o == "number" ? `${o}px` : o,
      height: typeof o == "number" ? `${o}px` : o,
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      style: { color: s, ...i },
    },
    n && !e && l.createElement("title", null, n),
    t,
  );
var d = (t) =>
    r.createElement(
      p,
      { ...t, ariaLabel: "scan-code, barcode" },
      r.createElement("path", { d: "M7 9H8V15H7V9Z", fill: "currentColor" }),
      r.createElement("path", { d: "M9 9H11V15H9V9Z", fill: "currentColor" }),
      r.createElement("path", { d: "M12 9H13V15H12V9Z", fill: "currentColor" }),
      r.createElement("path", { d: "M16 9H17V15H16V9Z", fill: "currentColor" }),
      r.createElement("path", { d: "M14 9H15V15H14V9Z", fill: "currentColor" }),
      r.createElement("path", {
        d: "M8.25 3.75H6.75C5.09315 3.75 3.75 5.09315 3.75 6.75V8.25",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
      r.createElement("path", {
        d: "M8.25 20H6.75C5.09315 20 3.75 18.6569 3.75 17V15.5",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
      r.createElement("path", {
        d: "M15.75 3.75H17.25C18.9069 3.75 20.25 5.09315 20.25 6.75V8.25",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
      r.createElement("path", {
        d: "M15.75 20.25H17.25C18.9069 20.25 20.25 18.9069 20.25 17.25V15.75",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
    ),
  V = d;
export { d as IconScanCode, V as default };
