import { type PathProps } from "../types.js";

export function Link({
  strokeWidth = "1.5",
  strokeLinecap = "round",
  strokeLinejoin = "round",
}: PathProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none">
      <path
        d="M8.125 4.60308L8.93038 3.79768C10.9385 1.78965 14.1941 1.78965 16.2021 3.79768C18.2101 5.80569 18.2101 9.06133 16.2021 11.0693L15.3949 11.8766"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M11.873 15.3985L11.0692 16.2023C9.06117 18.2103 5.80554 18.2103 3.79752 16.2023C1.7895 14.1943 1.78949 10.9387 3.79752 8.93067L4.60722 8.12094"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M7.9165 12.0833L12.0832 7.91666"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
