import { type PathProps } from "./types.js";

export function SettingsSlider({
  strokeWidth = "1.5",
  strokeLinecap = "round",
  strokeLinejoin = "round",
}: PathProps) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9.16667 4.66667H2.5M9.16667 4.66667C9.16667 3.46958 10.1363 2.5 11.3333 2.5C12.5304 2.5 13.5 3.46958 13.5 4.66667C13.5 5.86375 12.5304 6.83333 11.3333 6.83333C10.1363 6.83333 9.16667 5.86375 9.16667 4.66667ZM13.5 11.3333H8.16667M8.16667 11.3333C8.16667 12.5304 7.19707 13.5 6 13.5C4.80292 13.5 3.83333 12.5304 3.83333 11.3333M8.16667 11.3333C8.16667 10.1363 7.19707 9.16667 6 9.16667C4.80292 9.16667 3.83333 10.1363 3.83333 11.3333M3.83333 11.3333H2.5"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
      />
    </svg>
  );
}
