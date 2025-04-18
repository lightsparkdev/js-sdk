import { type PathProps } from "../types.js";

export function MediumStrengthIcon({
  strokeWidth = "1.5",
  strokeLinecap = "round",
  strokeLinejoin = "round",
}: PathProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      strokeWidth={strokeWidth}
      strokeLinecap={strokeLinecap}
      strokeLinejoin={strokeLinejoin}
    >
      <path
        d="M11.6133 2C10.969 2 10.4467 2.52233 10.4467 3.16667V12.8333C10.4467 13.4777 10.969 14 11.6133 14H12.8333C13.4777 14 14 13.4777 14 12.8333V3.16667C14 2.52233 13.4777 2 12.8333 2H11.6133Z"
        fill="#B6BAC3"
      />
      <path
        d="M7.38677 5.55566C6.74244 5.55566 6.22009 6.078 6.22009 6.72234V12.8335C6.22009 13.4777 6.74244 14.0001 7.38677 14.0001H8.60677C9.25111 14.0001 9.77344 13.4777 9.77344 12.8334V6.72234C9.77344 6.078 9.25111 5.55566 8.60677 5.55566H7.38677Z"
        fill="currentColor"
      />
      <path
        d="M3.16667 8.51855C2.52233 8.51855 2 9.04089 2 9.68522V12.8334C2 13.4778 2.52233 14.0001 3.16667 14.0001H4.38667C5.031 14.0001 5.55333 13.4778 5.55333 12.8334V9.68522C5.55333 9.04089 5.031 8.51855 4.38667 8.51855H3.16667Z"
        fill="currentColor"
      />
    </svg>
  );
}
