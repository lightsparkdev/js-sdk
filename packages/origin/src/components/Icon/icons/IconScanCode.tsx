import type { FC } from "react";

import { CentralIconBase, type CentralIconBaseProps } from "./CentralIconBase";

export const IconScanCode: FC<CentralIconBaseProps> = (props) => (
  <CentralIconBase {...props} ariaLabel="scan-code, barcode">
    <path d="M7 9H8V15H7V9Z" fill="currentColor" />
    <path d="M9 9H11V15H9V9Z" fill="currentColor" />
    <path d="M12 9H13V15H12V9Z" fill="currentColor" />
    <path d="M16 9H17V15H16V9Z" fill="currentColor" />
    <path d="M14 9H15V15H14V9Z" fill="currentColor" />
    <path
      d="M8.25 3.75H6.75C5.09315 3.75 3.75 5.09315 3.75 6.75V8.25"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8.25 20H6.75C5.09315 20 3.75 18.6569 3.75 17V15.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M15.75 3.75H17.25C18.9069 3.75 20.25 5.09315 20.25 6.75V8.25"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M15.75 20.25H17.25C18.9069 20.25 20.25 18.9069 20.25 17.25V15.75"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </CentralIconBase>
);

export default IconScanCode;
