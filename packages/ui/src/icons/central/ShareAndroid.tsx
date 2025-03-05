import { type PathProps } from "../types.js";

export function ShareAndroid({
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
        d="M9.00003 10.4286L14 7.57141M9.00003 13.5714L14 16.4286M20.25 6C20.25 7.79493 18.7949 9.25 17 9.25C15.2051 9.25 13.75 7.79493 13.75 6C13.75 4.20507 15.2051 2.75 17 2.75C18.7949 2.75 20.25 4.20507 20.25 6ZM20.25 18C20.25 19.7949 18.7949 21.25 17 21.25C15.2051 21.25 13.75 19.7949 13.75 18C13.75 16.2051 15.2051 14.75 17 14.75C18.7949 14.75 20.25 16.2051 20.25 18ZM9.25 12C9.25 13.7949 7.79493 15.25 6 15.25C4.20507 15.25 2.75 13.7949 2.75 12C2.75 10.2051 4.20507 8.75 6 8.75C7.79493 8.75 9.25 10.2051 9.25 12Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
      />
    </svg>
  );
}
