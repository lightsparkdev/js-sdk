import { type PathProps } from "../types.js";

export function Bell({
  strokeWidth = "2",
  strokeLinecap = "round",
  strokeLinejoin = "round",
}: PathProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M4.80754 9.46301C5.20136 5.78731 8.30327 3 12 3C15.6967 3 18.7986 5.78732 19.1925 9.46301L20 17H4L4.80754 9.46301Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
      />
      <path
        d="M16 17C16 19.2091 14.2091 21 12 21C9.79086 21 8 19.2091 8 17"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
      />
    </svg>
  );
}
