import { type PathProps } from "../types.js";

export function ArrowUpDown({
  strokeWidth = "1.5",
  strokeLinecap = "round",
  strokeLinejoin = "round",
}: PathProps = {}) {
  return (
    <svg
      width="22"
      height="18"
      viewBox="0 0 17 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3.58301 4.66667L6.24967 2L8.91634 4.66667M8.08333 11.3333L10.75 14L13.4167 11.3333M6.24967 2.66667V8.33333M10.75 7.66667V13.3333"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
      />
    </svg>
  );
}
