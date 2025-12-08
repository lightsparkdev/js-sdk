import { type PathProps } from "../types.js";

export function Postcard({
  strokeWidth = "2",
  strokeLinecap = "round",
  strokeLinejoin = "round",
}: PathProps) {
  return (
    <svg
      width="20"
      height="16"
      viewBox="0 0 20 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4.75 6.25H7.25M4.75 9.75H7.25M14.25 10.25H11.75C11.1977 10.25 10.75 9.8023 10.75 9.25V6.75C10.75 6.1977 11.1977 5.75 11.75 5.75H14.25C14.8023 5.75 15.25 6.1977 15.25 6.75V9.25C15.25 9.8023 14.8023 10.25 14.25 10.25ZM1.75 15.25H18.25C18.8023 15.25 19.25 14.8023 19.25 14.25V1.75C19.25 1.19772 18.8023 0.75 18.25 0.75H1.75C1.19772 0.75 0.75 1.19771 0.75 1.75V14.25C0.75 14.8023 1.19772 15.25 1.75 15.25Z"
        stroke="#16171A"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
      />
    </svg>
  );
}
