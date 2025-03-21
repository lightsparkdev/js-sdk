import { type PathProps } from "../types.js";

export function ShapesPlusXSquareCircleFill({
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
        d="M7 3C7.55228 3 8 3.44772 8 4V6H10C10.5523 6 11 6.44772 11 7C11 7.55228 10.5523 8 10 8H8V10C8 10.5523 7.55228 11 7 11C6.44772 11 6 10.5523 6 10V8H4C3.44772 8 3 7.55228 3 7C3 6.44772 3.44772 6 4 6H6V4C6 3.44772 6.44772 3 7 3Z"
        fill="currentColor"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M17 3C14.7909 3 13 4.79086 13 7C13 9.20914 14.7909 11 17 11C19.2091 11 21 9.20914 21 7C21 4.79086 19.2091 3 17 3Z"
        fill="currentColor"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M19.8287 15.5854C20.2193 15.1949 20.2193 14.5617 19.8287 14.1712C19.4382 13.7807 18.805 13.7807 18.4145 14.1712L17.0003 15.5854L15.5861 14.1712C15.1956 13.7807 14.5624 13.7807 14.1719 14.1712C13.7813 14.5617 13.7813 15.1949 14.1719 15.5854L15.5861 16.9996L14.1719 18.4138C13.7813 18.8044 13.7813 19.4375 14.1719 19.8281C14.5624 20.2186 15.1956 20.2186 15.5861 19.8281L17.0003 18.4138L18.4145 19.8281C18.805 20.2186 19.4382 20.2186 19.8287 19.8281C20.2193 19.4375 20.2193 18.8044 19.8287 18.4138L18.4145 16.9996L19.8287 15.5854Z"
        fill="currentColor"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M4 13C3.44772 13 3 13.4477 3 14V20C3 20.5523 3.44772 21 4 21H10C10.5523 21 11 20.5523 11 20V14C11 13.4477 10.5523 13 10 13H4Z"
        fill="currentColor"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
