import { type PathProps } from "../types.js";

export function CircleQuestionmarkFilled({
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
        d="M2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12ZM12.2374 8.41947C11.4455 8.37312 10.7008 8.76919 10.4615 9.48717C10.3305 9.88013 9.90579 10.0925 9.51283 9.96151C9.11987 9.83053 8.9075 9.40579 9.03849 9.01283C9.54916 7.48081 11.0545 6.84766 12.3251 6.92203C12.9724 6.95992 13.6313 7.17965 14.1421 7.62008C14.6688 8.07424 15 8.73335 15 9.54132C15 10.7022 14.2151 11.3895 13.6993 11.8411C13.6725 11.8646 13.6464 11.8874 13.6211 11.9097C13.0366 12.4253 12.75 12.7318 12.75 13.25C12.75 13.6642 12.4142 14 12 14C11.5858 14 11.25 13.6642 11.25 13.25C11.25 12.0002 12.0615 11.2849 12.6024 10.8081C12.6113 10.8003 12.6201 10.7925 12.6289 10.7848C13.2438 10.2424 13.5 9.97944 13.5 9.54132C13.5 9.17441 13.3624 8.92841 13.1626 8.75609C12.9468 8.57005 12.6213 8.44194 12.2374 8.41947ZM11 16C11 15.4477 11.4477 15 12 15C12.5523 15 13 15.4477 13 16C13 16.5523 12.5523 17 12 17C11.4477 17 11 16.5523 11 16Z"
        fill="currentColor"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
