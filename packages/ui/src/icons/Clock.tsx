import { type PathProps } from "./types.js";

export function Clock({
  strokeWidth = "1.5",
  strokeLinecap = "round",
  strokeLinejoin = "round",
}: PathProps) {
  return (
    <svg
      width="100%"
      viewBox="0 0 21 21"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10.5005 6.42187V10.5H14.5786M10.5005 20.0156C9.23785 20.0156 8.60652 20.0156 8.07651 19.9458C4.41653 19.464 1.53649 16.584 1.05464 12.924C0.984863 12.394 0.984863 11.7626 0.984863 10.5C0.984863 9.23736 0.984863 8.60604 1.05464 8.07602C1.53649 4.41604 4.41653 1.536 8.07651 1.05415C8.60652 0.984375 9.23785 0.984375 10.5005 0.984375C11.7631 0.984375 12.3945 0.984375 12.9245 1.05415C16.5845 1.536 19.4645 4.41604 19.9463 8.07602C20.0161 8.60604 20.0161 9.23736 20.0161 10.5C20.0161 11.7626 20.0161 12.394 19.9463 12.924C19.4645 16.584 16.5845 19.464 12.9245 19.9458C12.3945 20.0156 11.7631 20.0156 10.5005 20.0156Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
      />
    </svg>
  );
}
