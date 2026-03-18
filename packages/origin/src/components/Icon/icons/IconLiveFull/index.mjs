import p from "react";
import n from "react";
var l = ({
  children: r,
  size: e = 24,
  ariaLabel: o,
  color: a,
  ariaHidden: t = !0,
  style: s,
  ...C
}) =>
  n.createElement(
    "svg",
    {
      ...C,
      "aria-hidden": t,
      role: t ? void 0 : "img",
      width: typeof e == "number" ? `${e}px` : e,
      height: typeof e == "number" ? `${e}px` : e,
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      style: { color: a, ...s },
    },
    o && !t && n.createElement("title", null, o),
    r,
  );
var i = (r) =>
    p.createElement(
      l,
      { ...r, ariaLabel: "live-full, signal, podcast" },
      p.createElement("path", {
        d: "M5.45926 5.45996C3.78534 7.13388 2.75 9.44638 2.75 12.0007C2.75 14.555 3.78534 16.8675 5.45926 18.5414M8.36626 8.36696C7.4363 9.29691 6.86111 10.5816 6.86111 12.0007C6.86111 13.4198 7.4363 14.7045 8.36626 15.6344M15.6337 15.6344C16.5637 14.7045 17.1389 13.4198 17.1389 12.0007C17.1389 10.5816 16.5637 9.29691 15.6337 8.36696M18.5407 18.5414C20.2147 16.8675 21.25 14.555 21.25 12.0007C21.25 9.44638 20.2147 7.13388 18.5407 5.45996M12.75 12C12.75 12.4142 12.4142 12.75 12 12.75C11.5858 12.75 11.25 12.4142 11.25 12C11.25 11.5857 11.5858 11.25 12 11.25C12.4142 11.25 12.75 11.5857 12.75 12Z",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
    ),
  d = i;
export { i as IconLiveFull, d as default };
