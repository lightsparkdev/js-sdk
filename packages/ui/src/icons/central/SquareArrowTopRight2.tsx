import { type PathProps } from "../types.js";

export function SquareArrowTopRight2({
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
        d="M9.25 3.75H5.35C4.78995 3.75 4.50992 3.75 4.29601 3.85899C4.10785 3.95487 3.95487 4.10785 3.85899 4.29601C3.75 4.50992 3.75 4.78995 3.75 5.35V18.65C3.75 19.2101 3.75 19.4901 3.85899 19.704C3.95487 19.8922 4.10785 20.0451 4.29601 20.141C4.50992 20.25 4.78995 20.25 5.35 20.25H18.65C19.2101 20.25 19.4901 20.25 19.704 20.141C19.8922 20.0451 20.0451 19.8922 20.141 19.704C20.25 19.4901 20.25 19.2101 20.25 18.65V14.75M13.75 3.75H20.25M20.25 3.75V10.25M20.25 3.75L11 13"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
      />
    </svg>
  );
}
