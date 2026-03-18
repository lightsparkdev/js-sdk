import t from "react";
import p from "react";
var s = ({
  children: e,
  size: r = 24,
  ariaLabel: n,
  color: a,
  ariaHidden: o = !0,
  style: i,
  ...l
}) =>
  p.createElement(
    "svg",
    {
      ...l,
      "aria-hidden": o,
      role: o ? void 0 : "img",
      width: typeof r == "number" ? `${r}px` : r,
      height: typeof r == "number" ? `${r}px` : r,
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      style: { color: a, ...i },
    },
    n && !o && p.createElement("title", null, n),
    e,
  );
var c = (e) =>
    t.createElement(
      s,
      { ...e, ariaLabel: "pencil, edit, write" },
      t.createElement("path", {
        d: "M13.25 6.24997L15.25 4.24997C16.4926 3.00733 18.5074 3.00733 19.75 4.24997C20.9926 5.49261 20.9926 7.50733 19.75 8.74997L17.75 10.75L7.83579 20.6642C7.46071 21.0393 6.95201 21.25 6.42157 21.25H2.75V17.5784C2.75 17.048 2.96071 16.5393 3.33579 16.1642L13.25 6.24997Z",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
      t.createElement("path", {
        d: "M13.25 6.25L17.75 10.75",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
    ),
  L = c;
export { c as IconPencil, L as default };
