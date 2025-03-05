import { type PathProps } from "../types.js";

export function SquareBehindSquare1({
  strokeWidth = "1.5",
  strokeLinecap = "round",
  strokeLinejoin = "round",
}: PathProps) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M15.25 8.75V3.25C15.25 2.97386 15.0261 2.75 14.75 2.75H3.25C2.97386 2.75 2.75 2.97386 2.75 3.25V14.75C2.75 15.0261 2.97386 15.25 3.25 15.25H8.75M9.25 8.75H20.75C21.0261 8.75 21.25 8.97386 21.25 9.25V20.75C21.25 21.0261 21.0261 21.25 20.75 21.25H9.25C8.97386 21.25 8.75 21.0261 8.75 20.75V9.25C8.75 8.97386 8.97386 8.75 9.25 8.75Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
      />
    </svg>
  );
}
