import { type PathProps } from "./types.js";

export function UmaPaymentLoadingSpinner({
  strokeWidth = "3",
  strokeLinecap = "round",
}: PathProps) {
  return (
    <svg
      width="88"
      height="88"
      viewBox="0 0 88 88"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <ellipse
        cx="43.9983"
        cy="43.9994"
        rx="38.4983"
        ry="38.4994"
        stroke="#EBEEF2"
        strokeWidth={strokeWidth}
      />
      <path
        d="M82.5072 43.9994C82.5072 37.9238 81.0693 31.9344 78.3111 26.521C75.5529 21.1076 71.5528 16.4239 66.6376 12.8527C61.7225 9.28158 56.032 6.92443 50.0314 5.974C44.0308 5.02356 37.8904 5.50683 32.1123 7.3843"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
      />
    </svg>
  );
}
