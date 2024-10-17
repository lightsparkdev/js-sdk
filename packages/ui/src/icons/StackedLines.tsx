import { type PathProps } from "./types.js";

export function StackedLines({
  strokeWidth = "1.5",
  strokeLinecap = "round",
}: PathProps) {
  return (
    <svg
      viewBox="0 0 20 16"
      width="100%"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M18.5466 1.55566H1.1864M18.5466 8.00009H1.1864M18.5466 14.4445H1.1864"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
      />
    </svg>
  );
}
