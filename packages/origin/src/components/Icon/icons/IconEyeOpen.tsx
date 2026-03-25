import type { FC } from "react";

import { CentralIconBase, type CentralIconBaseProps } from "./CentralIconBase";

export const IconEyeOpen: FC<CentralIconBaseProps> = (props) => (
  <CentralIconBase
    {...props}
    ariaLabel="eye-open, show, see, reveal, look, visible"
  >
    <path
      d="M21.2742 10.685C16.4537 2.77174 7.54646 2.77164 2.72595 10.6849C2.23523 11.4904 2.23523 12.5094 2.72595 13.3149C7.54646 21.2282 16.4537 21.2283 21.2742 13.3151C21.7649 12.5095 21.7649 11.4905 21.2742 10.685Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M15.25 12C15.25 13.7949 13.7949 15.25 12 15.25C10.2051 15.25 8.75 13.7949 8.75 12C8.75 10.2051 10.2051 8.75 12 8.75C13.7949 8.75 15.25 10.2051 15.25 12Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </CentralIconBase>
);

export default IconEyeOpen;
