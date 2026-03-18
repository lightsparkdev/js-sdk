import a from "react";
import n from "react";
var p = ({
  children: r,
  size: e = 24,
  ariaLabel: o,
  color: s,
  ariaHidden: t = !0,
  style: i,
  ...l
}) =>
  n.createElement(
    "svg",
    {
      ...l,
      "aria-hidden": t,
      role: t ? void 0 : "img",
      width: typeof e == "number" ? `${e}px` : e,
      height: typeof e == "number" ? `${e}px` : e,
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      style: { color: s, ...i },
    },
    o && !t && n.createElement("title", null, o),
    r,
  );
var C = (r) =>
    a.createElement(
      p,
      { ...r, ariaLabel: "invite, briefing" },
      a.createElement("path", {
        d: "M4.75 10.9853V5.75C4.75 4.09315 6.09315 2.75 7.75 2.75H16.25C17.9069 2.75 19.25 4.09315 19.25 5.75V10.9853M9.75 7.75H14.25M12.9255 13.4498L19.9415 11.1744C20.5875 10.9649 21.25 11.4465 21.25 12.1256V17.25C21.25 18.9069 19.9069 20.25 18.25 20.25H5.75C4.09315 20.25 2.75 18.9069 2.75 17.25V12.1256C2.75 11.4465 3.41249 10.9649 4.0585 11.1744L11.0745 13.4498C11.6761 13.6449 12.3239 13.6449 12.9255 13.4498Z",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
    ),
  g = C;
export { C as IconInvite, g as default };
