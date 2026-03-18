import o from "react";
import s from "react";
var a = ({
  children: t,
  size: r = 24,
  ariaLabel: n,
  color: p,
  ariaHidden: e = !0,
  style: l,
  ...C
}) =>
  s.createElement(
    "svg",
    {
      ...C,
      "aria-hidden": e,
      role: e ? void 0 : "img",
      width: typeof r == "number" ? `${r}px` : r,
      height: typeof r == "number" ? `${r}px` : r,
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      style: { color: p, ...l },
    },
    n && !e && s.createElement("title", null, n),
    t,
  );
var i = (t) =>
    o.createElement(
      a,
      { ...t, ariaLabel: "tag, sale" },
      o.createElement("path", {
        d: "M2.75 10.7411V5.75C2.75 4.09315 4.09315 2.75 5.75 2.75H10.7411C11.5368 2.75 12.2998 3.06607 12.8624 3.62868L20.3787 11.1449C21.5503 12.3165 21.5503 14.216 20.3787 15.3876L15.3876 20.3787C14.216 21.5503 12.3165 21.5503 11.1449 20.3787L3.62868 12.8624C3.06607 12.2998 2.75 11.5368 2.75 10.7411Z",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinejoin: "round",
      }),
      o.createElement("path", {
        d: "M8.25 7.5C8.25 7.91421 7.91421 8.25 7.5 8.25C7.08579 8.25 6.75 7.91421 6.75 7.5C6.75 7.08579 7.08579 6.75 7.5 6.75C7.91421 6.75 8.25 7.08579 8.25 7.5Z",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinejoin: "round",
      }),
    ),
  g = i;
export { i as IconTag, g as default };
