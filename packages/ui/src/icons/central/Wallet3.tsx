import { type PathProps } from "../types.js";

export function Wallet3({
  strokeWidth = "1.5",
  strokeLinecap = "square",
  strokeLinejoin = "round",
}: PathProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
    >
      <path
        d="M3.125 5.41667V14.375C3.125 15.7557 4.24429 16.875 5.625 16.875H14.375C15.7557 16.875 16.875 15.7557 16.875 14.375V9.79167C16.875 8.41092 15.7557 7.29167 14.375 7.29167H13.5417M3.125 5.41667C3.125 6.4522 3.96447 7.29167 5 7.29167H13.5417M3.125 5.41667C3.125 4.15102 4.15102 3.125 5.41667 3.125H11.8056C12.7644 3.125 13.5417 3.90228 13.5417 4.86111V7.29167"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
      />
      <path
        d="M12.918 12.7085C13.2631 12.7085 13.543 12.4287 13.543 12.0835C13.543 11.7383 13.2631 11.4585 12.918 11.4585C12.5728 11.4585 12.293 11.7383 12.293 12.0835C12.293 12.4287 12.5728 12.7085 12.918 12.7085Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="0.5"
        strokeLinejoin={strokeLinejoin}
      />
    </svg>
  );
}
