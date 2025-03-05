import { type PathProps } from "../types.js";

export function SettingsGear2({
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
        d="M8.5515 5.36958L6.7588 4.95588C6.42284 4.87835 6.07064 4.97936 5.82684 5.22316L5.22316 5.82684C4.97936 6.07064 4.87835 6.42284 4.95588 6.7588L5.36958 8.5515C5.46311 8.9568 5.29598 9.37768 4.94989 9.60841L3.1953 10.7781C2.9171 10.9636 2.75 11.2758 2.75 11.6102V12.3898C2.75 12.7242 2.9171 13.0364 3.1953 13.2219L4.94989 14.3916C5.29598 14.6223 5.46311 15.0432 5.36958 15.4485L4.95588 17.2412C4.87835 17.5772 4.97936 17.9294 5.22316 18.1732L5.82684 18.7768C6.07064 19.0206 6.42284 19.1217 6.7588 19.0441L8.5515 18.6304C8.9568 18.5369 9.37768 18.704 9.60841 19.0501L10.7781 20.8047C10.9636 21.0829 11.2758 21.25 11.6102 21.25H12.3898C12.7242 21.25 13.0364 21.0829 13.2219 20.8047L14.3916 19.0501C14.6223 18.704 15.0432 18.5369 15.4485 18.6304L17.2412 19.0441C17.5772 19.1217 17.9294 19.0206 18.1732 18.7768L18.7768 18.1732C19.0206 17.9294 19.1217 17.5772 19.0441 17.2412L18.6304 15.4485C18.5369 15.0432 18.704 14.6223 19.0501 14.3916L20.8047 13.2219C21.0829 13.0364 21.25 12.7242 21.25 12.3898V11.6102C21.25 11.2758 21.0829 10.9636 20.8047 10.7781L19.0501 9.60841C18.704 9.37768 18.5369 8.9568 18.6304 8.5515L19.0441 6.7588C19.1217 6.42284 19.0206 6.07064 18.7768 5.82684L18.1732 5.22316C17.9294 4.97936 17.5772 4.87835 17.2412 4.95588L15.4485 5.36958C15.0432 5.46311 14.6223 5.29598 14.3916 4.94989L13.2219 3.1953C13.0364 2.9171 12.7242 2.75 12.3898 2.75H11.6102C11.2758 2.75 10.9636 2.9171 10.7781 3.1953L9.60841 4.94989C9.37768 5.29598 8.9568 5.46311 8.5515 5.36958Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinejoin={strokeLinejoin}
      />
      <path
        d="M14.75 12C14.75 13.5188 13.5188 14.75 12 14.75C10.4812 14.75 9.25 13.5188 9.25 12C9.25 10.4812 10.4812 9.25 12 9.25C13.5188 9.25 14.75 10.4812 14.75 12Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinejoin={strokeLinejoin}
      />
    </svg>
  );
}
