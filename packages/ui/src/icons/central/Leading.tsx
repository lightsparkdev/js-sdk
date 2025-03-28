import { type PathProps } from "../types.js";

export function Leading({
  strokeWidth = "1.5",
  strokeLinecap = "square",
  strokeLinejoin = "round",
}: PathProps) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9.37492 7.70869H13.1249C14.9658 7.70869 16.4583 9.20108 16.4583 11.042V11.5247C16.4583 14.8249 13.7828 17.5003 10.4826 17.5003C8.26398 17.5003 6.22797 16.2712 5.19465 14.3078L2.70825 9.58366L3.33376 8.80174C3.90878 8.083 4.95759 7.96647 5.67637 8.54149L6.45825 9.16699V3.75033C6.45825 2.94491 7.11117 2.29199 7.91659 2.29199C8.722 2.29199 9.37492 2.94491 9.37492 3.75033V7.70869Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
