import { type PathProps } from "../types.js";

export function ChevronDoubleDown({
  strokeWidth = "1.5",
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
        d="M8 13.5L11.4697 16.9697C11.7626 17.2626 12.2374 17.2626 12.5303 16.9697L16 13.5M8 6.5L11.4697 9.96967C11.7626 10.2626 12.2374 10.2626 12.5303 9.96967L16 6.5"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
      />
    </svg>
  );
}
