import { type PathProps } from "../types.js";

export function Phone({
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
        d="M9.75 19.25H14.25M6.75 22.25H17.25C17.8023 22.25 18.25 21.8023 18.25 21.25V2.75C18.25 2.19772 17.8023 1.75 17.25 1.75H6.75C6.19772 1.75 5.75 2.19772 5.75 2.75V21.25C5.75 21.8023 6.19772 22.25 6.75 22.25Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
