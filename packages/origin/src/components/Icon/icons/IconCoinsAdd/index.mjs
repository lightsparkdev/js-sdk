import s from "react";
import n from "react";
var p = ({
  children: o,
  size: e = 24,
  ariaLabel: t,
  color: a,
  ariaHidden: r = !0,
  style: C,
  ...l
}) =>
  n.createElement(
    "svg",
    {
      ...l,
      "aria-hidden": r,
      role: r ? void 0 : "img",
      width: typeof e == "number" ? `${e}px` : e,
      height: typeof e == "number" ? `${e}px` : e,
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      style: { color: a, ...C },
    },
    t && !r && n.createElement("title", null, t),
    o,
  );
var i = (o) =>
    s.createElement(
      p,
      { ...o, ariaLabel: "coins-add, money" },
      s.createElement("path", {
        d: "M15 11.75V14M15 14V16.25M15 14H12.75M15 14H17.25M14.6766 7.38126C13.686 5.23749 11.5167 3.75 9 3.75C5.54822 3.75 2.75 6.54822 2.75 10C2.75 13.3961 5.45873 16.1596 8.83359 16.2478M21.25 14C21.25 17.4518 18.4518 20.25 15 20.25C12.3406 20.25 10.0691 18.589 9.16641 16.2478C8.89745 15.5503 8.75 14.7924 8.75 14C8.75 10.6039 11.4587 7.84038 14.8336 7.75217C14.8889 7.75073 14.9444 7.75 15 7.75C18.4518 7.75 21.25 10.5482 21.25 14Z",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
    ),
  f = i;
export { i as IconCoinsAdd, f as default };
