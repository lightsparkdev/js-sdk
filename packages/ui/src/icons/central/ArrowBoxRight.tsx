import { type PathProps } from "../types.js";

export function ArrowBoxRight({
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
        d="M14.75 3.75H19.25C19.8023 3.75 20.25 4.19772 20.25 4.75V19.25C20.25 19.8023 19.8023 20.25 19.25 20.25H14.75M15 12H3.75M15 12L11.5 15.5M15 12L11.5 8.5"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
