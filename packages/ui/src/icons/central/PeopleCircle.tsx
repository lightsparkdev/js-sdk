import { type PathProps } from "../types.js";

export function PeopleCircle({
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
        d="M12 0C5.37258 0 0 5.37258 0 12C0 15.4764 1.4783 18.6076 3.84056 20.7991C5.98169 22.7855 8.84902 24 12 24C15.151 24 18.0184 22.7855 20.1594 20.7991C22.5217 18.6076 24 15.4764 24 12C24 5.37258 18.6274 0 12 0ZM4.77126 19.1962C6.35903 17.0088 8.89337 15.6 12 15.6C15.1067 15.6 17.641 17.0088 19.2287 19.1962C17.3816 21.0516 14.8249 22.2 12 22.2C9.17507 22.2 6.61837 21.0516 4.77126 19.1962ZM15.6 9.6C15.6 11.5883 13.9883 13.2 12 13.2C10.0117 13.2 8.4 11.5883 8.4 9.6C8.4 7.61178 10.0117 6 12 6C13.9883 6 15.6 7.61178 15.6 9.6Z"
        fill="currentColor"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
