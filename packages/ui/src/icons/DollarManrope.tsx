// Copyright  ©, 2022, Lightspark Group, Inc. - All Rights Reserved

import { type PathProps } from "./types.js";

export function DollarManrope({
  strokeWidth = "1.5",
  strokeLinecap = "round",
  strokeLinejoin = "round",
}: PathProps) {
  return (
    <svg
      width="100%"
      viewBox="0 0 10 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5.00003 2.3291V0.84668M5.00003 15.6709V17.1533M8.53134 4.55273C7.82641 3.66654 6.50905 3.07031 5.00003 3.07031H4.54706C2.54571 3.07031 0.92334 4.25023 0.92334 5.70572V5.81886C0.92334 6.85997 1.73211 7.81163 3.01249 8.27722L6.98757 9.72275C8.26797 10.1883 9.07666 11.14 9.07666 12.1811C9.07666 13.699 7.3847 14.9296 5.29736 14.9296H5.00003C3.49101 14.9296 2.17365 14.3334 1.46872 13.4472"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
      />
    </svg>
  );
}
