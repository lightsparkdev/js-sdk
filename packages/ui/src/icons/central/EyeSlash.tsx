import { type PathProps } from "../types.js";

export function EyeSlash({
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
        d="M9.38184 5.13889C13.776 3.81629 18.6162 5.86729 21.6273 11.2918C21.7593 11.5297 21.8253 11.6486 21.8562 11.7987C21.8811 11.92 21.8811 12.0799 21.8562 12.2013C21.8253 12.3513 21.7595 12.4699 21.6279 12.707C21.0491 13.75 20.4027 14.6683 19.7048 15.4619"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
      />
      <path
        d="M9.5 9.92322C9.03166 10.4864 8.75 11.2103 8.75 12C8.75 13.7949 10.2051 15.25 12 15.25C12.8035 15.25 13.5389 14.9584 14.1061 14.4753"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
      />
      <path
        d="M6.22264 6.75C4.77316 7.82826 3.45438 9.34251 2.37201 11.2927C2.24036 11.53 2.17453 11.6486 2.1437 11.7986C2.11877 11.92 2.11877 12.0799 2.14371 12.2012C2.17454 12.3513 2.24046 12.47 2.3723 12.7076C5.97916 19.206 12.211 20.8633 17.1567 17.6795"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
      />
      <path
        d="M2.75 2.75L21.25 21.25"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
      />
    </svg>
  );
}
