import { type PathProps } from "../types.js";

export function FileText({
  strokeWidth = "2",
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
        d="M12.3358 2.75H5.75C5.19772 2.75 4.75 3.19772 4.75 3.75V20.25C4.75 20.8023 5.19771 21.25 5.75 21.25H18.25C18.8023 21.25 19.25 20.8023 19.25 20.25V9.66421C19.25 9.399 19.1446 9.14464 18.9571 8.95711L13.0429 3.04289C12.8554 2.85536 12.601 2.75 12.3358 2.75Z"
        stroke="#16171A"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
      />
      <path
        d="M8.75 13.25H12.25M8.75 17.25H15.25"
        stroke="#16171A"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
      />
      <path
        d="M12.75 3.25V8.25C12.75 8.80228 13.1977 9.25 13.75 9.25H18.75"
        stroke="#16171A"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
      />
    </svg>
  );
}
