import { type PathProps } from "../types.js";

export function Contacts({
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
        d="M19 21H5V18H19V3H5V17.5"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
      />
      <path
        d="M12.0015 12C10.4866 12 10.116 12.6357 10.028 12.8934C10.0088 12.9494 10.0528 13 10.112 13H13.891C13.9502 13 13.9941 12.9494 13.975 12.8934C13.887 12.6357 13.5164 12 12.0015 12Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
      />
      <path
        d="M12.75 8.75C12.75 9.16421 12.4142 9.5 12 9.5C11.5858 9.5 11.25 9.16421 11.25 8.75M12.75 8.75C12.75 8.33579 12.4142 8 12 8C11.5858 8 11.25 8.33579 11.25 8.75M12.75 8.75H11.25"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
      />
    </svg>
  );
}
