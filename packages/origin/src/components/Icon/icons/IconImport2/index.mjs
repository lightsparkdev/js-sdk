import t from "react";
import p from "react";
var s = ({
  children: o,
  size: r = 24,
  ariaLabel: n,
  color: a,
  ariaHidden: e = !0,
  style: l,
  ...i
}) =>
  p.createElement(
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
      style: { color: a, ...l },
    },
    n && !e && p.createElement("title", null, n),
    o,
  );
var m = (o) =>
    t.createElement(
      s,
      { ...o, ariaLabel: "import-2, download, save" },
      t.createElement("path", {
        d: "M21.25 8.75V16.25C21.25 17.9069 19.9069 19.25 18.25 19.25H5.75C4.09315 19.25 2.75 17.9069 2.75 16.25V7.75C2.75 6.09315 4.09315 4.75 5.75 4.75H8.25",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
      t.createElement("path", {
        d: "M21.25 4.75H17C14.2386 4.75 12 6.98858 12 9.75V15M12 15L8.25 11.25M12 15L15.75 11.25",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
    ),
  f = m;
export { m as IconImport2, f as default };
