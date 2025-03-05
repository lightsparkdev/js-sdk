import { type PathProps } from "../types.js";

export function Megaphone({
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
        d="M18.2461 14.0001C19.9029 14.0001 21.2461 12.6569 21.2461 11.0001C21.2461 9.34323 19.9029 8.00008 18.2461 8.00008M12.5754 18.2501C12.1636 19.4153 11.0523 20.2501 9.74609 20.2501C8.08924 20.2501 6.74609 18.9069 6.74609 17.2501V15.7501M6.74829 6.25009V15.7501M18.2461 4.10542V17.8947C18.2461 18.568 17.5943 19.0488 16.9511 18.8502L3.45108 14.682C3.03196 14.5526 2.74609 14.1652 2.74609 13.7265V8.27362C2.74609 7.83498 3.03196 7.44754 3.45108 7.31813L16.9511 3.14993C17.5943 2.95132 18.2461 3.43221 18.2461 4.10542Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
      />
    </svg>
  );
}
