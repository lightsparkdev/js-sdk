import { type PathProps } from "../types.js";

export function EyeOpen({
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
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.0006 4.75C15.635 4.75003 19.1692 6.99503 21.4533 11.2743C21.6942 11.7257 21.6942 12.2745 21.4533 12.7259C19.1692 17.0051 15.635 19.2501 12.0006 19.25C8.36613 19.25 4.83199 17.005 2.54789 12.7258C2.30695 12.2744 2.30695 11.7255 2.54789 11.2742C4.83199 6.99492 8.36614 4.74997 12.0006 4.75ZM8.7154 12C8.7154 10.1857 10.1862 8.71487 12.0006 8.71487C13.8149 8.71487 15.2858 10.1857 15.2858 12C15.2858 13.8144 13.8149 15.2852 12.0006 15.2852C10.1862 15.2852 8.7154 13.8144 8.7154 12Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
      />
    </svg>
  );
}
