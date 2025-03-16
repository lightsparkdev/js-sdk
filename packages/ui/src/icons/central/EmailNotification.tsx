import { type PathProps } from "../types.js";

export function EmailNotification({
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
        d="M13.75 4.75H3.75C3.19772 4.75 2.75 5.19771 2.75 5.75V18.25C2.75 18.8023 3.19772 19.25 3.75 19.25H20.25C20.8023 19.25 21.25 18.8023 21.25 18.25V12.25M2.99805 9.25C5.50528 11.1337 8.62204 12.25 11.9995 12.25C13.5675 12.25 15.0793 12.0094 16.5 11.5631M23.25 6C23.25 7.79493 21.7949 9.25 20 9.25C18.2051 9.25 16.75 7.79493 16.75 6C16.75 4.20507 18.2051 2.75 20 2.75C21.7949 2.75 23.25 4.20507 23.25 6Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
