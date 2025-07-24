import { type PathProps } from "../types.js";

export function LoadingCircle({
  strokeWidth = "2",
  strokeLinecap = "round",
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
        d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
        stroke="black"
        strokeOpacity="0.3"
        strokeWidth={strokeWidth}
      />
      <path
        d="M20.9451 13C20.4839 17.1716 17.1716 20.4839 13 20.9451"
        stroke="#1A1A1A"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
      />
    </svg>
  );
}
