import { type PathProps } from "./types.js";

export function UmaBridgeLoadingTransparent({
  strokeWidth = "2.09994",
  strokeLinecap = "round",
}: PathProps) {
  return (
    <svg
      width="100%"
      viewBox="0 0 21 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <ellipse
        opacity="0.3"
        cx="10.4996"
        cy="9.99998"
        rx="8.74961"
        ry="8.74986"
        stroke="#F9F9F9"
        strokeWidth={strokeWidth}
      />
      <path
        d="M19.2503 9.99998C19.2503 8.61916 18.9235 7.25795 18.2966 6.02763C17.6697 4.79731 16.7606 3.73282 15.6435 2.9212C14.5265 2.10957 13.2332 1.57386 11.8694 1.35785C10.5056 1.14184 9.11007 1.25168 7.79688 1.67837"
        stroke="#F9F9F9"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
      />
    </svg>
  );
}
