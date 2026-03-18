import t from "react";
import p from "react";
var s = ({
  children: o,
  size: r = 24,
  ariaLabel: n,
  color: C,
  ariaHidden: e = !0,
  style: a,
  ...l
}) =>
  p.createElement(
    "svg",
    {
      ...l,
      "aria-hidden": e,
      role: e ? void 0 : "img",
      width: typeof r == "number" ? `${r}px` : r,
      height: typeof r == "number" ? `${r}px` : r,
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      style: { color: C, ...a },
    },
    n && !e && p.createElement("title", null, n),
    o,
  );
var i = (o) =>
    t.createElement(
      s,
      { ...o, ariaLabel: "thumb-down-curved" },
      t.createElement("path", {
        d: "M11.587 21.1915L12.0582 21.25C13.5 16.5 16.25 15.5366 16.25 12.7163V6.05504C16.25 5.25261 15.7858 4.51099 15.0271 4.23642C12.4523 3.30469 9.75909 3.10538 7.03639 3.33986C5.37371 3.48306 4.07077 4.75909 3.70442 6.37718L2.82727 10.2514C2.38907 12.1869 3.87013 14.0267 5.86638 14.0267H10.4815L9.49609 17.2092C8.92665 19.0484 9.6657 20.9528 11.587 21.1915Z",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinejoin: "round",
      }),
      t.createElement("path", {
        d: "M21.25 12.25C21.25 13.3546 20.3546 14.25 19.25 14.25C17.5931 14.25 16.25 12.9069 16.25 11.25V6.75C16.25 5.09315 17.5931 3.75 19.25 3.75C20.3546 3.75 21.25 4.64543 21.25 5.75V12.25Z",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinejoin: "round",
      }),
    ),
  h = i;
export { i as IconThumbDownCurved, h as default };
