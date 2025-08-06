import { type PathProps } from "../types.js";

export function Clipboard2({
  strokeWidth = "2",
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
        d="M8 5H7C5.34315 5 4 6.34315 4 8V18C4 19.6569 5.34315 21 7 21H17C18.6569 21 20 19.6569 20 18V8C20 6.34315 18.6569 5 17 5H16"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinejoin={strokeLinejoin}
      />
      <path
        d="M8 6C8 4.34315 9.34315 3 11 3H13C14.6569 3 16 4.34315 16 6V7H8V6Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinejoin={strokeLinejoin}
      />
    </svg>
  );
}
