import t from "react";
import l from "react";
var p = ({
  children: r,
  size: e = 24,
  ariaLabel: n,
  color: C,
  ariaHidden: o = !0,
  style: a,
  ...s
}) =>
  l.createElement(
    "svg",
    {
      ...s,
      "aria-hidden": o,
      role: o ? void 0 : "img",
      width: typeof e == "number" ? `${e}px` : e,
      height: typeof e == "number" ? `${e}px` : e,
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      style: { color: C, ...a },
    },
    n && !o && l.createElement("title", null, n),
    r,
  );
var i = (r) =>
    t.createElement(
      p,
      { ...r, ariaLabel: "stop-circle" },
      t.createElement("path", {
        fillRule: "evenodd",
        clipRule: "evenodd",
        d: "M12 3.5C7.30558 3.5 3.5 7.30558 3.5 12C3.5 16.6944 7.30558 20.5 12 20.5C16.6944 20.5 20.5 16.6944 20.5 12C20.5 7.30558 16.6944 3.5 12 3.5ZM2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12Z",
        fill: "currentColor",
      }),
      t.createElement("path", {
        d: "M9.5 10.5C9.5 9.94772 9.94772 9.5 10.5 9.5H13.5C14.0523 9.5 14.5 9.94772 14.5 10.5V13.5C14.5 14.0523 14.0523 14.5 13.5 14.5H10.5C9.94772 14.5 9.5 14.0523 9.5 13.5V10.5Z",
        fill: "currentColor",
      }),
    ),
  d = i;
export { i as IconStopCircle, d as default };
