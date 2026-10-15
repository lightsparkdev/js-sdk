import type { FC } from "react";

import { CentralIconBase, type CentralIconBaseProps } from "./CentralIconBase";

export const IconCreditCard2: FC<CentralIconBaseProps> = (props) => (
  <CentralIconBase {...props} ariaLabel="credit-card-2, card, payment">
    <path
      d="M2.75 9.75005V16.2461C2.75 17.903 4.09315 19.2461 5.75 19.2461L18.2422 19.2461C19.899 19.2461 21.2422 17.903 21.2422 16.2461L21.2461 9.75005M2.75 9.75005V7.75293C2.75 6.09608 4.09315 4.75293 5.75 4.75293H18.2461C19.9029 4.75293 21.2461 6.09608 21.2461 7.75293V9.75005M2.75 9.75005H21.2461M6.75 13.25H9.75"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </CentralIconBase>
);

export default IconCreditCard2;
