import { type PathProps } from "../types.js";

export function Passkeys({
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
        d="M12.9996 12.8145C12.675 12.7719 12.3415 12.75 11.9996 12.75C8.17569 12.75 5.39226 15.4942 4.65442 19.1697C4.53893 19.745 5.00437 20.25 5.59116 20.25H13.9996M15.7496 6.5C15.7496 8.57107 14.0706 10.25 11.9996 10.25C9.9285 10.25 8.24957 8.57107 8.24957 6.5C8.24957 4.42893 9.9285 2.75 11.9996 2.75C14.0706 2.75 15.7496 4.42893 15.7496 6.5ZM15.7496 14C15.7496 12.7574 16.7569 11.75 17.9996 11.75C19.2422 11.75 20.2496 12.7574 20.2496 14C20.2496 14.7801 19.8526 15.4675 19.2496 15.8711V17L18.7496 17.9356L19.2496 18.9678V20L17.9996 21L16.7496 20V15.8711C16.1466 15.4675 15.7496 14.7801 15.7496 14Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
      />
    </svg>
  );
}
