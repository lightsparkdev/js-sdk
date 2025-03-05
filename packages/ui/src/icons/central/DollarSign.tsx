import { type PathProps } from "../types.js";

export function DollarSign({
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
        d="M12.0005 5.3291V3.84668M12.0005 18.6709V20.1533M15.5318 7.55273C14.8269 6.66654 13.5095 6.07031 12.0005 6.07031H11.5475C9.5462 6.07031 7.92383 7.25023 7.92383 8.70572V8.81886C7.92383 9.85997 8.7326 10.8116 10.013 11.2772L13.9881 12.7227C15.2685 13.1883 16.0771 14.14 16.0771 15.1811C16.0771 16.699 14.3852 17.9296 12.2978 17.9296H12.0005C10.4915 17.9296 9.17414 17.3334 8.46921 16.4472"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
      />
    </svg>
  );
}
