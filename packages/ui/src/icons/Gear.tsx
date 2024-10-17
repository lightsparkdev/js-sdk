// Copyright  ©, 2022, Lightspark Group, Inc. - All Rights Reserved

import { type PathProps } from "./types.js";

export function Gear({
  strokeWidth = "1",
  strokeLinecap = "butt",
  strokeLinejoin = "miter",
}: PathProps) {
  return (
    <svg
      width="100%"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M7.57136 6C7.57136 6.86788 6.86781 7.57143 5.99993 7.57143C5.13205 7.57143 4.4285 6.86788 4.4285 6C4.4285 5.13212 5.13205 4.42857 5.99993 4.42857C6.86781 4.42857 7.57136 5.13212 7.57136 6Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
      />
      <path
        d="M4.66071 1.54383C5.06493 0.152055 6.93494 0.152055 7.33915 1.54383C7.55431 2.28466 8.27658 2.72402 8.99308 2.54993C10.3392 2.22287 11.2742 3.92918 10.3323 4.9939C9.83095 5.56064 9.83095 6.43936 10.3323 7.0061C11.2742 8.07082 10.3392 9.77713 8.99308 9.45007C8.27658 9.27598 7.55431 9.71534 7.33915 10.4562C6.93494 11.8479 5.06493 11.8479 4.66071 10.4562C4.44556 9.71534 3.72328 9.27598 3.00679 9.45007C1.6607 9.77713 0.725699 8.07082 1.66757 7.0061C2.16891 6.43936 2.16891 5.56064 1.66757 4.9939C0.725699 3.92918 1.6607 2.22287 3.00679 2.54993C3.72328 2.72402 4.44556 2.28466 4.66071 1.54383Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
      />
    </svg>
  );
}
