import type { FC } from "react";

import { CentralIconBase, type CentralIconBaseProps } from "./CentralIconBase";

export const IconPrompt: FC<CentralIconBaseProps> = (props) => (
  <CentralIconBase {...props} ariaLabel="prompt, scan-text">
    <path
      d="M6.25 4.75H5.75C4.09315 4.75 2.75 6.09315 2.75 7.75V8.25"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M17.75 4.75H18.25C19.9069 4.75 21.25 6.09315 21.25 7.75V8.25"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M21.25 15.75V16.25C21.25 17.9069 19.9069 19.25 18.25 19.25H17.75"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6.25 19.25H5.75C4.09315 19.25 2.75 17.9069 2.75 16.25V15.75"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M7.75 9.75H16.25"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M7.75 14.25H14.25"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </CentralIconBase>
);

export default IconPrompt;
