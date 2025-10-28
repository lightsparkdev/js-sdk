import { type PathProps } from "../types.js";

export function Variables({
  strokeWidth = "1.5",
  strokeLinecap = "round",
  strokeLinejoin = "round",
}: PathProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
    >
      <path
        d="M8.75056 2.80515C9.52406 2.35857 10.4771 2.35857 11.2506 2.80515L15.6066 5.3201C16.3801 5.76669 16.8566 6.592 16.8566 7.48517V12.515C16.8566 13.4082 16.3801 14.2335 15.6066 14.6801L11.2506 17.1951C10.4771 17.6417 9.52406 17.6417 8.75056 17.1951L4.39453 14.6801C3.62103 14.2335 3.14453 13.4082 3.14453 12.515V7.48517C3.14453 6.592 3.62103 5.76669 4.39453 5.3201L8.75056 2.80515Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
      />
      <path
        d="M9.375 10H10.625M11.25 10C11.25 10.6903 10.6903 11.25 10 11.25C9.30967 11.25 8.75 10.6903 8.75 10C8.75 9.30967 9.30967 8.75 10 8.75C10.6903 8.75 11.25 9.30967 11.25 10Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
      />
    </svg>
  );
}
