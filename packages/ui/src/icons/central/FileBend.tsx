import { type PathProps } from "../types.js";

export function FileBend({
  strokeWidth = "2",
  strokeLinecap = "round",
  strokeLinejoin = "round",
}: PathProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none">
      <path
        d="M10.6237 2.70817V6.0415C10.6237 6.96198 11.3699 7.70817 12.2904 7.70817H15.6237M6.45703 2.2915H9.93336C10.3754 2.2915 10.7993 2.4671 11.1119 2.77966L15.5522 7.22001C15.8648 7.53258 16.0404 7.9565 16.0404 8.3985V15.2082C16.0404 16.5889 14.9211 17.7082 13.5404 17.7082H6.45703C5.07632 17.7082 3.95703 16.5889 3.95703 15.2082V4.7915C3.95703 3.4108 5.07632 2.2915 6.45703 2.2915Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinejoin={strokeLinejoin}
      />
    </svg>
  );
}
