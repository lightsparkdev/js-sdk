import { type PathProps } from "./types.js";

export function CentralArrowShareRight({
  strokeWidth = "1.5",
  strokeLinecap = "round",
  strokeLinejoin = "round",
}: PathProps = {}) {
  return (
    <svg
      width="22"
      height="18"
      viewBox="0 0 22 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M21 9L11.5 0.75V5.5C3 5.5 0.75 8.75 0.75 17.25C2.25 14.25 3 12.5 11.5 12.5V17.25L21 9Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
      />
    </svg>
  );
}
