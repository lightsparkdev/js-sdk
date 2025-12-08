import { type PathProps } from "../types.js";

export function ChecklistMagnifyingGlass({
  strokeWidth = "2",
  strokeLinecap = "round",
  strokeLinejoin = "round",
}: PathProps) {
  return (
    <svg
      width="38"
      height="38"
      viewBox="0 0 38 38"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M21.616 12H26.616M34.5 16.5V3.5C34.5 2.39544 33.6046 1.5 32.5 1.5H3.5C2.39544 1.5 1.5 2.39544 1.5 3.5V32.5C1.5 33.6046 2.39544 34.5 3.5 34.5H16.5M32.7426 32.728C30.3994 35.071 26.6006 35.071 24.2574 32.728C21.9142 30.3848 21.9142 26.5858 24.2574 24.2426C26.6006 21.8994 30.3994 21.8994 32.7426 24.2426C35.0858 26.5858 35.0858 30.3848 32.7426 32.728ZM32.7426 32.728L36.5 36.4852M14.3715 10.1289L12.2502 12.2502M12.2502 12.2502L10.1289 14.3715M12.2502 12.2502L10.1289 10.1289M12.2502 12.2502L14.3715 14.3715M14.3715 22.1289L12.2502 24.2502M12.2502 24.2502L10.1289 26.3715M12.2502 24.2502L10.1289 22.1289M12.2502 24.2502L14.3715 26.3715"
        stroke="#6D7685"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
      />
    </svg>
  );
}
