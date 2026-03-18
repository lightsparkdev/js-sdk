import e from "react";
import s from "react";
var p = ({
  children: o,
  size: r = 24,
  ariaLabel: n,
  color: a,
  ariaHidden: t = !0,
  style: i,
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
      style: { color: a, ...i },
    },
    n && !t && s.createElement("title", null, n),
    o,
  );
var d = (o) =>
    e.createElement(
      p,
      { ...o, ariaLabel: "telescope, deep-search, research" },
      e.createElement("path", {
        d: "M5.87482 10.7456L2.46785 11.9856C1.68938 12.269 1.288 13.1297 1.57134 13.9082L1.99886 15.0828C2.2822 15.8613 3.14297 16.2627 3.92143 15.9793L7.32841 14.7393",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
      e.createElement("path", {
        d: "M11.2873 7.64258L7.38682 9.06222C6.34886 9.44001 5.81369 10.5877 6.19147 11.6256L7.00377 13.8574C7.38155 14.8954 8.52924 15.4305 9.56719 15.0528L13.4676 13.6331",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
      e.createElement("path", {
        d: "M13.2745 5.78896L18.1855 4.00151C18.964 3.71818 19.8247 4.11956 20.1081 4.89802L21.9892 10.0663C22.2725 10.8448 21.8711 11.7056 21.0927 11.9889L16.1817 13.7763C14.8843 14.2486 13.4497 13.5796 12.9774 12.2822L11.7804 8.99324C11.3081 7.69579 11.9771 6.26119 13.2745 5.78896Z",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
      e.createElement("path", {
        d: "M10.75 20.25V14.75",
        stroke: "currentColor",
        strokeWidth: "1.5",
      }),
      e.createElement("path", {
        d: "M7.75 20.25L13.75 20.25",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
      }),
    ),
  h = d;
export { d as IconTelescope, h as default };
