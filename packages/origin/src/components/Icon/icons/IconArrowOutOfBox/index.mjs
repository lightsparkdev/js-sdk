import p from "react";
import n from "react";
var a = ({
  children: o,
  size: r = 24,
  ariaLabel: t,
  color: s,
  ariaHidden: e = !0,
  style: l,
  ...i
}) =>
  n.createElement(
    "svg",
    {
      ...i,
      "aria-hidden": e,
      role: e ? void 0 : "img",
      width: typeof r == "number" ? `${r}px` : r,
      height: typeof r == "number" ? `${r}px` : r,
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      style: { color: s, ...l },
    },
    t && !e && n.createElement("title", null, t),
    o,
  );
var m = (o) =>
    p.createElement(
      a,
      { ...o, ariaLabel: "arrow-out-of-box, upload, share" },
      p.createElement("path", {
        d: "M12 3.75V15M12 3.75L16.5 8.25M12 3.75L7.5 8.25M20.25 14.75V17.25C20.25 18.9069 18.9069 20.25 17.25 20.25H6.75C5.09315 20.25 3.75 18.9069 3.75 17.25V14.75",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
    ),
  x = m;
export { m as IconArrowOutOfBox, x as default };
