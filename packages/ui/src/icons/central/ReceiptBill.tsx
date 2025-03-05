import { type PathProps } from "../types.js";

export function ReceiptBill({
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
        d="M8.75 7.75H15.25M8.75 11.75H11.25M19.25 21.25V3.75C19.25 3.19772 18.8023 2.75 18.25 2.75H5.75C5.19772 2.75 4.75 3.19772 4.75 3.75V21.25L7.33333 19L9.66667 21.25L12 19L14.3333 21.25L16.6667 19L19.25 21.25Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
      />
    </svg>
  );
}
