// Copyright  ©, 2022, Lightspark Group, Inc. - All Rights Reserved

import { useId } from "react";

export function SolanaTokenBackground() {
  const uid = useId();
  const backgroundGradient = `sol__background-${uid}`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      height="100%"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path fill={`url(#${backgroundGradient})`} d="M24 0H0v24h24z" />
      <path
        fill="#fff"
        d="M17.7 8.357a.55.55 0 0 1-.365.145H4.515c-.455 0-.685-.52-.37-.825l2.105-2.03c.1-.095.23-.15.365-.15h12.87c.46 0 .685.525.365.83zm0 10.006c-.1.09-.23.14-.365.14H4.515c-.455 0-.685-.515-.37-.82l2.105-2.035c.1-.095.23-.145.365-.145h12.87c.46 0 .685.52.365.825zm0-7.72a.55.55 0 0 0-.365-.14H4.515c-.455 0-.685.515-.37.82l2.105 2.035c.1.09.23.145.365.145h12.87c.46 0 .685-.52.365-.825z"
      />
      <defs>
        <linearGradient
          id={backgroundGradient}
          x1="4"
          x2="20.384"
          y1="15.841"
          y2="15.192"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#599DB0" />
          <stop offset="1" stopColor="#47F8C3" />
        </linearGradient>
      </defs>
    </svg>
  );
}
