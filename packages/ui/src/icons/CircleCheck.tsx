import { invertStrokeColor } from "./constants.js";
import { type PathProps } from "./types.js";

export function CircleCheck({
  strokeWidth = "1.14286",
  strokeLinecap = "butt",
  strokeLinejoin = "miter",
}: PathProps) {
  return (
    <svg
      width="100%"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="8" cy="8" r="8" fill="currentColor" />
      <path
        d="M4.57153 7.98591L6.65379 10.0682C6.65379 10.0682 9.08556 7.6364 11.0076 5.71436"
        className={invertStrokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
      />
    </svg>
  );
}
