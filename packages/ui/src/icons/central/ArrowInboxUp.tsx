import { type PathProps } from "../types.js";

export function ArrowInboxUp({
  strokeWidth = "1.5",
  strokeLinecap = "round",
  strokeLinejoin = "round",
}: PathProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
    >
      <path
        d="M10 3.125V12.5M10 3.125L13.75 6.875M10 3.125L6.25 6.875M16.875 10.625V16.0417C16.875 16.5019 16.5019 16.875 16.0417 16.875H3.95833C3.4981 16.875 3.125 16.5019 3.125 16.0417V10.625"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
      />
    </svg>
  );
}
