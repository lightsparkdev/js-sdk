import type { FC } from "react";

import { CentralIconBase, type CentralIconBaseProps } from "./CentralIconBase";

export const IconReceiptBill: FC<CentralIconBaseProps> = (props) => (
  <CentralIconBase {...props} ariaLabel="receipt-bill, purchase, invoice">
    <path
      d="M8.75 7.75H15.25M8.75 11.75H11.25M19.25 21.25V5.75C19.25 4.09315 17.9069 2.75 16.25 2.75H7.75C6.09315 2.75 4.75 4.09315 4.75 5.75V21.25L7.33333 19L9.66667 21.25L12 19L14.3333 21.25L16.6667 19L19.25 21.25Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </CentralIconBase>
);

export default IconReceiptBill;
