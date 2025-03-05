import { type PathProps } from "../types.js";

export function ArrowsRepeatLeftRight({
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
        d="M17.4999 21.25L20.1464 18.6036C20.3416 18.4083 20.3416 18.0917 20.1464 17.8964L17.4999 15.25M6.49992 2.75L3.85348 5.39645C3.65822 5.59171 3.65822 5.90829 3.85348 6.10355L6.49992 8.75M5.24992 5.75H19.2499C19.8022 5.75 20.2499 6.19772 20.2499 6.75V10.75M3.74992 13.75V17.25C3.74992 17.8023 4.19764 18.25 4.74992 18.25H18.7499"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
      />
    </svg>
  );
}
