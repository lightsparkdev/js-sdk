import o from "react";
import p from "react";
var a = ({
  children: e,
  size: r = 24,
  ariaLabel: n,
  color: l,
  ariaHidden: t = !0,
  style: s,
  ...C
}) =>
  p.createElement(
    "svg",
    {
      ...C,
      "aria-hidden": t,
      role: t ? void 0 : "img",
      width: typeof r == "number" ? `${r}px` : r,
      height: typeof r == "number" ? `${r}px` : r,
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      style: { color: l, ...s },
    },
    n && !t && p.createElement("title", null, n),
    e,
  );
var m = (e) =>
    o.createElement(
      a,
      { ...e, ariaLabel: "supabase" },
      o.createElement("path", {
        d: "M13.6849 21.9296C13.1601 22.5905 12.096 22.2284 12.0833 21.3845L11.8984 9.04199H20.1975C21.7007 9.04199 22.5391 10.7782 21.6044 11.9554L13.6849 21.9296Z",
        fill: "currentColor",
      }),
      o.createElement("path", {
        d: "M10.3124 2.06985C10.8372 1.40889 11.9013 1.77105 11.914 2.61492L11.995 14.9574H3.79976C2.29653 14.9574 1.45815 13.2212 2.3929 12.044L10.3124 2.06985Z",
        fill: "currentColor",
      }),
    ),
  g = m;
export { m as IconSupabase, g as default };
