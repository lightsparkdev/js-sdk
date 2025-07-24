import { type PathProps } from "../types.js";

export function Heart2({
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
        d="M12 5.76834C18.1619 -0.481842 28.7252 11.1257 12 20.5C-4.72522 11.1257 5.83804 -0.481843 12 5.76834Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinejoin={strokeLinejoin}
      />
    </svg>
  );
}
