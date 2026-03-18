import o from "react";
import s from "react";
var p = ({
  children: e,
  size: r = 24,
  ariaLabel: n,
  color: a,
  ariaHidden: t = !0,
  style: i,
  ...l
}) =>
  s.createElement(
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
    n && !t && s.createElement("title", null, n),
    e,
  );
var d = (e) =>
    o.createElement(
      p,
      { ...e, ariaLabel: "folder-add-right" },
      o.createElement("path", {
        d: "M11.25 19.25H5.75C4.09315 19.25 2.75 17.9069 2.75 16.25V6.75C2.75 5.09315 4.09315 3.75 5.75 3.75H8.39445C9.39751 3.75 10.3342 4.2513 10.8906 5.0859L11.1094 5.4141C11.6658 6.2487 12.6025 6.75 13.6056 6.75H18.25C19.9069 6.75 21.25 8.09315 21.25 9.75V10.25",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
      o.createElement("path", {
        d: "M18 13.75V17V20.25",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
      o.createElement("path", {
        d: "M14.75 17H18H21.25",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
    ),
  h = d;
export { d as IconFolderAddRight, h as default };
