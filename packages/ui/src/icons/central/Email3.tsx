import { type PathProps } from "../types.js";

export function Email3({
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
        d="M21.0015 9.25C18.4942 11.1337 15.3775 12.25 12 12.25C8.62252 12.25 5.50577 11.1337 2.99854 9.25M2.75 4.75H21.25V19.25H2.75V4.75Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
