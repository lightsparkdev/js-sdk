import l from "react";
import n from "react";
var c = ({
  children: r,
  size: e = 24,
  ariaLabel: t,
  color: p,
  ariaHidden: o = !0,
  style: a,
  ...C
}) =>
  n.createElement(
    "svg",
    {
      ...C,
      "aria-hidden": o,
      role: o ? void 0 : "img",
      width: typeof e == "number" ? `${e}px` : e,
      height: typeof e == "number" ? `${e}px` : e,
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      style: { color: p, ...a },
    },
    t && !o && n.createElement("title", null, t),
    r,
  );
var i = (r) =>
    l.createElement(
      c,
      {
        ...r,
        ariaLabel:
          "circle-check, check radio, circle, checkbox, check, checkmark, confirm",
      },
      l.createElement("path", {
        fillRule: "evenodd",
        clipRule: "evenodd",
        d: "M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM15.5805 9.97493C15.8428 9.65434 15.7955 9.18183 15.4749 8.91953C15.1543 8.65724 14.6818 8.70449 14.4195 9.02507L10.4443 13.8837L9.03033 12.4697C8.73744 12.1768 8.26256 12.1768 7.96967 12.4697C7.67678 12.7626 7.67678 13.2374 7.96967 13.5303L9.96967 15.5303C10.1195 15.6802 10.3257 15.7596 10.5374 15.7491C10.749 15.7385 10.9463 15.6389 11.0805 15.4749L15.5805 9.97493Z",
        fill: "currentColor",
      }),
    ),
  u = i;
export { i as IconCircleCheck, u as default };
