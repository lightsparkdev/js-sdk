// Copyright  ©, 2022, Lightspark Group, Inc. - All Rights Reserved

import { useId } from "react";

export function LoadingSpinner() {
  /**
   * unique id is required per instance to prevent interferring ids breaking
   * icon styles
   */
  const id = useId();

  return (
    <svg
      width="100%"
      viewBox="0 0 17 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath={`url(#clip0_448_7848)-${id})`}>
        <circle cx="8.5" cy="8.5" r="7" stroke="#E6E6E6" strokeWidth="2" />
        <path
          d="M8.5 15.5C4.63401 15.5 1.5 12.366 1.5 8.5C1.5 4.63401 4.63401 1.5 8.5 1.5"
          stroke="black"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <mask
          id={`mask0_448_7848-${id}`}
          style={{ maskType: "alpha" }}
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="10"
          height="17"
        >
          <path
            d="M8.5 15.5C4.63401 15.5 1.5 12.366 1.5 8.5C1.5 4.63401 4.63401 1.5 8.5 1.5"
            stroke="black"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </mask>
        <g mask={`url(#mask0_448_7848-${id})`}>
          <g filter={`url(#filter0_f_448_7848)-${id})`}>
            <ellipse
              cx="9"
              cy="4"
              rx="47"
              ry="19"
              fill={`url(#paint0_radial_448_7848-${id})`}
            />
          </g>
          <g filter={`url(#filter1_f_448_7848)-${id})`}>
            <ellipse
              cx="9.5"
              cy="-6.5"
              rx="31.5"
              ry="25.5"
              fill={`url(#paint1_radial_448_7848-${id})`}
            />
          </g>
        </g>
      </g>
      <defs>
        <filter
          id={`filter0_f_448_7848-${id}`}
          x="-44"
          y="-21"
          width="106"
          height="50"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feGaussianBlur
            stdDeviation="3"
            result="effect1_foregroundBlur_448_7848"
          />
        </filter>
        <filter
          id={`filter1_f_448_7848-${id}`}
          x="-28"
          y="-38"
          width="75"
          height="63"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feGaussianBlur
            stdDeviation="3"
            result="effect1_foregroundBlur_448_7848"
          />
        </filter>
        <radialGradient
          id={`paint0_radial_448_7848-${id}`}
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(9.09573 3.9613) rotate(161.271) scale(31.3334 19.6551)"
        >
          <stop stopColor="#0066FF" />
          <stop offset="1" stopColor="#0066FF" stopOpacity="0" />
        </radialGradient>
        <radialGradient
          id={`paint1_radial_448_7848-${id}`}
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(9.56416 -6.55194) rotate(145.825) scale(24.0388 23.0445)"
        >
          <stop stopColor="#FFC700" />
          <stop offset="1" stopColor="#BF09FF" stopOpacity="0" />
        </radialGradient>
        <clipPath id={`clip0_448_7848-${id}`}>
          <rect
            width="16"
            height="16"
            fill="white"
            transform="translate(0.5 0.5)"
          />
        </clipPath>
      </defs>
    </svg>
  );
}
