import { type PathProps } from "../types.js";

export function Bank({
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
        d="M20.2297 8.83298V17.6817M15.6892 17.6817V8.83298M3.77027 8.83298V17.6817M8.31081 17.6817V8.83298M20.5467 17.6817H3.4533C2.9647 17.6817 2.53092 17.9863 2.37642 18.4381L1.99803 19.5442C1.75302 20.2604 2.30012 21 3.07492 21H20.9251C21.6998 21 22.247 20.2604 22.002 19.5442L21.6236 18.4381C21.4691 17.9863 21.0353 17.6817 20.5467 17.6817ZM21.3649 8.83298H2.63514C2.00822 8.83298 1.5 8.33776 1.5 7.72689V7.21615C1.5 6.79885 1.74102 6.41707 2.12328 6.22889L11.4882 1.61883C11.81 1.46039 12.19 1.46039 12.5118 1.61883L21.8767 6.22889C22.259 6.41707 22.5 6.79885 22.5 7.21615V7.72689C22.5 8.33776 21.9918 8.83298 21.3649 8.83298Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
