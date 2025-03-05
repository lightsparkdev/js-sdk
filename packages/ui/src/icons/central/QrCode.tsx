import { type PathProps } from "../types.js";

export function QrCode({
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
        d="M13.75 13.75V16.25H16.25M17.75 13.75H20.25M20.25 17.75H17.75V20.25M13.75 19.75V20.25M4.75 20.25H9.25C9.80228 20.25 10.25 19.8023 10.25 19.25V14.75C10.25 14.1977 9.80228 13.75 9.25 13.75H4.75C4.19772 13.75 3.75 14.1977 3.75 14.75V19.25C3.75 19.8023 4.19772 20.25 4.75 20.25ZM14.75 10.25H19.25C19.8023 10.25 20.25 9.80228 20.25 9.25V4.75C20.25 4.19772 19.8023 3.75 19.25 3.75H14.75C14.1977 3.75 13.75 4.19772 13.75 4.75V9.25C13.75 9.80228 14.1977 10.25 14.75 10.25ZM4.75 10.25H9.25C9.80228 10.25 10.25 9.80228 10.25 9.25V4.75C10.25 4.19772 9.80228 3.75 9.25 3.75H4.75C4.19772 3.75 3.75 4.19772 3.75 4.75V9.25C3.75 9.80228 4.19772 10.25 4.75 10.25Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
      />
    </svg>
  );
}
