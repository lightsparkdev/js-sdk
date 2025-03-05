import { type PathProps } from "../types.js";

export function Pencil({
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
        d="M13.248 6.24997L16.2909 3.20708C16.6814 2.81655 17.3146 2.81655 17.7051 3.20708L20.7909 6.29286C21.1814 6.68339 21.1814 7.31655 20.7909 7.70708L17.748 10.75M13.248 6.24997L3.04094 16.4571C2.85341 16.6446 2.74805 16.899 2.74805 17.1642V21.25H6.83384C7.09905 21.25 7.35341 21.1446 7.54094 20.9571L17.748 10.75"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
      />
    </svg>
  );
}
