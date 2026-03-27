import { type PathProps } from "./types.js";

export function GridLogo({ fill = "currentColor" }: PathProps) {
  return (
    <svg
      width="100%"
      viewBox="0 0 10.4 10.4"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4.28801 0V3.05605H6.11199V0H10.4V4.28801H7.34395V6.11199H10.4V10.4H6.11199V7.34395H4.28801V10.4H0V6.11199H3.05605V4.28801H0V0H4.28801ZM7.34395 9.16804H9.16804V7.34395H7.34395V9.16804ZM1.23196 9.16804H3.05605V7.34395H1.23196V9.16804ZM4.28801 6.11199H6.11199V4.28801H4.28801V6.11199ZM7.34395 3.05605H9.16804V1.23196H7.34395V3.05605ZM1.23196 3.05605H3.05605V1.23196H1.23196V3.05605Z"
        fill={fill}
        fillRule="evenodd"
        clipRule="evenodd"
      />
    </svg>
  );
}
