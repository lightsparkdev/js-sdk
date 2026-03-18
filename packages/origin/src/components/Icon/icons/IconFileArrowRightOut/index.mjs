import o from "react";
import s from "react";
var i = ({
  children: t,
  size: r = 24,
  ariaLabel: n,
  color: p,
  ariaHidden: e = !0,
  style: a,
  ...u
}) =>
  s.createElement(
    "svg",
    {
      ...u,
      "aria-hidden": e,
      role: e ? void 0 : "img",
      width: typeof r == "number" ? `${r}px` : r,
      height: typeof r == "number" ? `${r}px` : r,
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      style: { color: p, ...a },
    },
    n && !e && s.createElement("title", null, n),
    t,
  );
var l = (t) =>
    o.createElement(
      i,
      {
        ...t,
        ariaLabel: "file-arrow-right-out, document-arrow-right-out, outgoing",
      },
      o.createElement("path", {
        d: "M19.25 12.25V10.4926C19.25 9.69699 18.9339 8.93393 18.3713 8.37132L13.6287 3.62868C13.0661 3.06607 12.303 2.75 11.5074 2.75H7.75C6.09315 2.75 4.75 4.09315 4.75 5.75V18.25C4.75 19.9069 6.09315 21.25 7.75 21.25H9.25",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
      o.createElement("path", {
        d: "M12.75 3.25439V7.24982C12.75 8.35439 13.6454 9.24982 14.75 9.24982H18.7501",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
      o.createElement("path", {
        d: "M12.75 19H19",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
      o.createElement("path", {
        d: "M17.25 16L20.25 19L17.25 22",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
    ),
  k = l;
export { l as IconFileArrowRightOut, k as default };
