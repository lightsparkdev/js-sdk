import { type PathProps } from "../types.js";

export function PlusSmall({
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
        d="M12 6.75V12M12 12V17.25M12 12H6.75M12 12H17.25"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
