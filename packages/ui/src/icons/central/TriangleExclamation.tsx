import { type PathProps } from "../types.js";

export function TriangleExclamation({
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
        d="M12.0001 9.7499V13.2499M12.0001 15.7499V15.7399M11.1372 3.22311L2.63179 17.7445C2.24133 18.4111 2.72209 19.2499 3.49467 19.2499H20.5055C21.2781 19.2499 21.7588 18.4111 21.3684 17.7445L12.863 3.22311C12.4767 2.56365 11.5235 2.56365 11.1372 3.22311ZM12.2501 15.7499C12.2501 15.888 12.1382 15.9999 12.0001 15.9999C11.862 15.9999 11.7501 15.888 11.7501 15.7499C11.7501 15.6118 11.862 15.4999 12.0001 15.4999C12.1382 15.4999 12.2501 15.6118 12.2501 15.7499Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
      />
    </svg>
  );
}
