import { type PathProps } from "../types.js";

export function CircleCheckFilled({
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
        fillRule="evenodd"
        clipRule="evenodd"
        d="M1 12C1 5.92487 5.92487 1 12 1C18.0751 1 23 5.92487 23 12C23 18.0751 18.0751 23 12 23C5.92487 23 1 18.0751 1 12ZM15.7257 9.59828C15.918 9.36319 15.8833 9.01668 15.6483 8.82432C15.4132 8.63198 15.0667 8.66663 14.8743 8.90172L10.3092 14.4814L8.53891 12.711C8.32412 12.4963 7.97588 12.4963 7.7611 12.711C7.5463 12.9259 7.5463 13.2741 7.7611 13.489L9.96104 15.689C10.0709 15.7987 10.2222 15.857 10.3774 15.8493C10.5326 15.8415 10.6772 15.7686 10.7757 15.6483L15.7257 9.59828Z"
        fill="currentColor"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
