import p from "react";
import n from "react";
var a = ({
  children: r,
  size: e = 24,
  ariaLabel: o,
  color: s,
  ariaHidden: t = !0,
  style: l,
  ...c
}) =>
  n.createElement(
    "svg",
    {
      ...c,
      "aria-hidden": t,
      role: t ? void 0 : "img",
      width: typeof e == "number" ? `${e}px` : e,
      height: typeof e == "number" ? `${e}px` : e,
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      style: { color: s, ...l },
    },
    o && !t && n.createElement("title", null, o),
    r,
  );
var i = (r) =>
    p.createElement(
      a,
      { ...r, ariaLabel: "broken-heart, delete-account" },
      p.createElement("path", {
        d: "M12 5.57193C18.3331 -0.86765 29.1898 11.0916 12 20.75C-5.18982 11.0916 5.66687 -0.867651 12 5.57193ZM12 5.57193C11.1207 6.53558 10.4876 7.78832 10 8.99993L13 11.9999L12 14.9999",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
    ),
  f = i;
export { i as IconBrokenHeart, f as default };
