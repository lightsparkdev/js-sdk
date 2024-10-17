import { type PathProps } from "./types.js";

export function ReceiptBill({
  strokeWidth = "2.5",
  strokeLinecap = "round",
  strokeLinejoin = "round",
}: PathProps) {
  return (
    <svg
      width="100%"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M14.5827 12.9163H25.416M14.5827 19.583H18.7493M32.0827 35.4163V6.24967C32.0827 5.32921 31.3365 4.58301 30.416 4.58301H9.58268C8.66222 4.58301 7.91602 5.32921 7.91602 6.24967V35.4163L12.2216 31.6663L16.1105 35.4163L19.9993 31.6663L23.8882 35.4163L27.7772 31.6663L32.0827 35.4163Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
      />
    </svg>
  );
}
