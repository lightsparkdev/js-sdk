import { invertStrokeColor } from "./constants.js";
import { type PathProps } from "./types.js";

export function CirclePlus({
  strokeWidth = "1.5",
  strokeLinecap = "butt",
  strokeLinejoin = "miter",
}: PathProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24ZM11.0994 8.10001C11.0994 7.60295 11.5024 7.20001 11.9994 7.20001C12.4965 7.20001 12.8994 7.60296 12.8994 8.10001V11.1001L15.8998 11.1001C16.3969 11.1001 16.7998 11.503 16.7998 12.0001C16.7998 12.4971 16.3969 12.9001 15.8998 12.9001H12.8994V15.9C12.8994 16.3971 12.4965 16.8 11.9994 16.8C11.5024 16.8 11.0994 16.3971 11.0994 15.9V12.9001H8.09982C7.60276 12.9001 7.19982 12.4971 7.19982 12.0001C7.19982 11.503 7.60276 11.1001 8.09982 11.1001H11.0994V8.10001Z"
        fill="currentColor"
        className={invertStrokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
      />
    </svg>
  );
}
