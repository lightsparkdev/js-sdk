import { type PathProps } from "../types.js";

export function Lock({
  strokeWidth = "2",
  strokeLinecap = "round",
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
        d="M16.25 9.75V7.25C16.25 4.90279 14.3472 3 12 3C9.65279 3 7.75 4.90279 7.75 7.25V9.75M12 14V17M5.75 21.25H18.25C18.8023 21.25 19.25 20.8023 19.25 20.25V10.75C19.25 10.1977 18.8023 9.75 18.25 9.75H5.75C5.19772 9.75 4.75 10.1977 4.75 10.75V20.25C4.75 20.8023 5.19771 21.25 5.75 21.25Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
