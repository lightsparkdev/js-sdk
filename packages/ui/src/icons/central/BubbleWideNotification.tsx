import { type PathProps } from "../types.js";

export function BubbleWideNotification({
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
        d="M12 14.25V11.25M12 8.25H12.01M3.75 12C3.75 7.52166 3.75 5.28249 5.14124 3.89124C6.53249 2.5 8.77166 2.5 13.25 2.5H15.25C19.7283 2.5 21.9675 2.5 23.3587 3.89124C24.75 5.28249 24.75 7.52166 24.75 12C24.75 16.4783 24.75 18.7175 23.3587 20.1087C21.9675 21.5 19.7283 21.5 15.25 21.5H13.25C8.77166 21.5 6.53249 21.5 5.14124 20.1087C3.75 18.7175 3.75 16.4783 3.75 12Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
