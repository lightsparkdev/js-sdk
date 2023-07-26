// Copyright  ©, 2022, Lightspark Group, Inc. - All Rights Reserved

import { useTheme } from "@emotion/react";
import { nanoid } from "nanoid";
import { useRef } from "react";

function JavaScriptTwoTone() {
  /* unique id is required per instance to prevent interferring ids breaking icon styles */
  const idRef = useRef(nanoid());
  const id = idRef.current;
  const theme = useTheme();

  return (
    <svg
      width="100%"
      viewBox="0 0 25 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath={`url(#clip0_286_523-${id})`}>
        <path
          d="M24.667 24H0.666992V0H24.667L12.667 12L24.667 24Z"
          fill="currentColor"
        />
      </g>
      <g clipPath={`url(#clip1_286_523-${id})`}>
        <path d="M24.667 0H0.666992V24H24.667V0Z" fill="currentColor" />
        <path
          d="M16.79 18.7499C17.2734 19.5393 17.9024 20.1194 19.0147 20.1194C19.9492 20.1194 20.5462 19.6524 20.5462 19.0071C20.5462 18.2337 19.9328 17.9598 18.9043 17.5099L18.3404 17.268C16.713 16.5747 15.6319 15.7061 15.6319 13.8699C15.6319 12.1785 16.9206 10.8909 18.9347 10.8909C20.3686 10.8909 21.3995 11.3899 22.1424 12.6966L20.3862 13.8242C19.9995 13.1309 19.5824 12.8577 18.9347 12.8577C18.2742 12.8577 17.8555 13.2768 17.8555 13.8242C17.8555 14.5008 18.2745 14.7747 19.2422 15.1937L19.806 15.4352C21.7222 16.257 22.8041 17.0947 22.8041 18.9781C22.8041 21.0086 21.209 22.121 19.0669 22.121C16.9724 22.121 15.6193 21.1229 14.9572 19.8147L16.79 18.7499ZM8.82311 18.9453C9.1774 19.5739 9.49969 20.1053 10.2745 20.1053C11.0155 20.1053 11.4829 19.8154 11.4829 18.6882V11.0196H13.7382V18.7187C13.7382 21.0539 12.369 22.1168 10.3705 22.1168C8.56483 22.1168 7.51911 21.1823 6.9873 20.0568L8.82311 18.9453Z"
          fill={theme.bg}
        />
      </g>
      <defs>
        <clipPath id={`clip0_286_523-${id}`}>
          <rect
            width="24"
            height="24"
            fill={theme.bg}
            transform="translate(0.666992)"
          />
        </clipPath>
        <clipPath id={`clip1_286_523-${id}`}>
          <rect
            width="24"
            height="24"
            fill={theme.bg}
            transform="translate(0.666992)"
          />
        </clipPath>
      </defs>
    </svg>
  );
}

export default JavaScriptTwoTone;
