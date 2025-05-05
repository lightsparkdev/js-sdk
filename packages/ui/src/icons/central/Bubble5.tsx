import { type PathProps } from "../types.js";

export function Bubble5({
  strokeWidth = "2",
  strokeLinecap = "round",
  strokeLinejoin = "round",
}: PathProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
    >
      <path
        d="M25.375 14C25.375 7.98437 20.9513 4.375 14 4.375C7.04861 4.375 2.625 7.98437 2.625 14C2.625 15.5596 3.69896 18.2064 3.86692 18.6109C3.88199 18.6472 3.89691 18.6803 3.91043 18.7172C4.02604 19.0325 4.50009 20.7115 2.625 23.1966C5.15278 24.3997 7.83727 22.4219 7.83727 22.4219C9.69457 23.403 11.9044 23.625 14 23.625C20.9513 23.625 25.375 20.0156 25.375 14Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
