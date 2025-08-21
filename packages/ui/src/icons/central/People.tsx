import { type PathProps } from "../types.js";

export function People({
  strokeWidth = "1.5",
  strokeLinecap = "round",
  strokeLinejoin = "round",
}: PathProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M15.749 6.5C15.749 8.57107 14.0701 10.25 11.999 10.25C9.92795 10.25 8.24902 8.57107 8.24902 6.5C8.24902 4.42893 9.92795 2.75 11.999 2.75C14.0701 2.75 15.749 4.42893 15.749 6.5Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinejoin={strokeLinejoin}
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M11.9985 13.25C8.20293 13.25 5.43245 15.7735 4.67009 19.1657C4.54089 19.7406 5.0077 20.25 5.59696 20.25H18.4001C18.9894 20.25 19.4562 19.7406 19.327 19.1657C18.5646 15.7735 15.7941 13.25 11.9985 13.25Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinejoin={strokeLinejoin}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
