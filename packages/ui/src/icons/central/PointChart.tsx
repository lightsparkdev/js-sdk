import { type PathProps } from "../types.js";

export function PointChart({
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
        d="M4 4V20H20"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
      />
      <path
        d="M9.5 14.5H9.51M10 14.5C10 14.7761 9.77614 15 9.5 15C9.22386 15 9 14.7761 9 14.5C9 14.2239 9.22386 14 9.5 14C9.77614 14 10 14.2239 10 14.5Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
      />
      <path
        d="M11.5 8.5H11.51M12 8.5C12 8.77614 11.7761 9 11.5 9C11.2239 9 11 8.77614 11 8.5C11 8.22386 11.2239 8 11.5 8C11.7761 8 12 8.22386 12 8.5Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
      />
      <path
        d="M16.5 11.5H16.51M17 11.5C17 11.7761 16.7761 12 16.5 12C16.2239 12 16 11.7761 16 11.5C16 11.2239 16.2239 11 16.5 11C16.7761 11 17 11.2239 17 11.5Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
      />
      <path
        d="M18.5 5.5H18.51M19 5.5C19 5.77614 18.7761 6 18.5 6C18.2239 6 18 5.77614 18 5.5C18 5.22386 18.2239 5 18.5 5C18.7761 5 19 5.22386 19 5.5Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
      />
    </svg>
  );
}
