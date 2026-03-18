import p from "react";
import n from "react";
var a = ({
  children: r,
  size: o = 24,
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
      width: typeof o == "number" ? `${o}px` : o,
      height: typeof o == "number" ? `${o}px` : o,
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      style: { color: s, ...l },
    },
    t && !e && n.createElement("title", null, t),
    r,
  );
var m = (r) =>
    p.createElement(
      a,
      { ...r, ariaLabel: "arrow-inbox, download, file, down, save" },
      p.createElement("path", {
        d: "M20.25 14.75V17.25C20.25 18.9069 18.9069 20.25 17.25 20.25H6.75C5.09315 20.25 3.75 18.9069 3.75 17.25V14.75M12 15V3.75M12 15L8.5 11.5M12 15L15.5 11.5",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
    ),
  f = m;
export { m as IconArrowInbox, f as default };
