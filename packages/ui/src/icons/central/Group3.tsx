import { type PathProps } from "../types.js";

export function Group3({
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
        d="M17.7498 19.25H21.4228C22.0042 19.25 22.468 18.754 22.3704 18.1808C21.8389 15.0624 20.0189 12.75 16.9998 12.75C16.5537 12.75 16.1338 12.8005 15.7404 12.8966M11.2497 7C11.2497 8.79493 9.79461 10.25 7.99969 10.25C6.20476 10.25 4.74969 8.79493 4.74969 7C4.74969 5.20507 6.20476 3.75 7.99969 3.75C9.79461 3.75 11.2497 5.20507 11.2497 7ZM7.99969 13.25C4.20408 13.25 1.43361 15.7735 0.671244 19.1657C0.542047 19.7406 1.00886 20.25 1.59812 20.25H14.4013C14.9905 20.25 15.4573 19.7406 15.3281 19.1657C14.5658 15.7735 11.7953 13.25 7.99969 13.25ZM19.2497 7C19.2497 8.79493 17.7946 10.25 15.9997 10.25C14.2048 10.25 12.7497 8.79493 12.7497 7C12.7497 5.20507 14.2048 3.75 15.9997 3.75C17.7946 3.75 19.2497 5.20507 19.2497 7Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
