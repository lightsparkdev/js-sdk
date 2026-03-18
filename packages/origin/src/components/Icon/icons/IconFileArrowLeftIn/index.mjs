import o from "react";
import s from "react";
var i = ({
  children: e,
  size: r = 24,
  ariaLabel: n,
  color: p,
  ariaHidden: t = !0,
  style: a,
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
      style: { color: p, ...a },
    },
    n && !t && s.createElement("title", null, n),
    e,
  );
var d = (e) =>
    o.createElement(
      i,
      {
        ...e,
        ariaLabel: "file-arrow-left-in, document-arrow-left-in, incoming",
      },
      o.createElement("path", {
        d: "M14.75 21.25H16.25C17.9069 21.25 19.25 19.9069 19.25 18.25V10.4926C19.25 9.69699 18.9339 8.93393 18.3713 8.37132L13.6287 3.62868C13.0661 3.06607 12.303 2.75 11.5074 2.75H7.75C6.09315 2.75 4.75 4.09315 4.75 5.75V13",
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
        d: "M3.75 19H10",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
      o.createElement("path", {
        d: "M8.25 16L11.25 19L8.25 22",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
    ),
  m = d;
export { d as IconFileArrowLeftIn, m as default };
