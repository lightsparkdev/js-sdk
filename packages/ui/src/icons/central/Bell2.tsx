import { type PathProps } from "../types.js";

export function Bell2({
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
        d="M16 17.25C16 19.4591 14.2091 21.25 12 21.25C9.79086 21.25 8 19.4591 8 17.25M18.4965 8.90897L18.6922 12.7842C18.6994 12.9264 18.7369 13.0655 18.8021 13.192L20.1388 15.7843C20.2119 15.9261 20.25 16.0846 20.25 16.2441C20.25 16.7964 19.8023 17.25 19.25 17.25H4.75C4.19772 17.25 3.75 16.7964 3.75 16.2441C3.75 16.0846 3.78809 15.9261 3.86124 15.7843L5.19789 13.192C5.26314 13.0655 5.30065 12.9264 5.30781 12.7842L5.50355 8.90897C5.6772 5.90951 8.15634 3.5 11.1612 3.5H12.8388C15.8437 3.5 18.3228 5.90951 18.4965 8.90897Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
      />
    </svg>
  );
}
