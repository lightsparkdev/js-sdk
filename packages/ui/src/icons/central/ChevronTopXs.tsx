import { type PathProps } from "../types.js";

export function ChevronTopXs({
  strokeWidth = "1.5",
  strokeLinecap = "round",
  strokeLinejoin = "round",
}: PathProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M8 14L10.9393 11.0607C11.5251 10.4749 12.4749 10.4749 13.0607 11.0607L16 14"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
