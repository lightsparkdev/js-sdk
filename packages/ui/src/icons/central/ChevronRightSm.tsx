import { type PathProps } from "../types.js";

export function ChevronRightSm({
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
        d="M9.05176 18L14.5214 12.5304C14.8143 12.2374 14.8143 11.7626 14.5214 11.4696L9.05176 6"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
