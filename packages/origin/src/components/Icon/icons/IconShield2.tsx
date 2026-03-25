import type { FC } from "react";

import { CentralIconBase, type CentralIconBaseProps } from "./CentralIconBase";

export const IconShield2: FC<CentralIconBaseProps> = (props) => (
  <CentralIconBase {...props} ariaLabel="shield-2, safety, privacy">
    <path
      d="M3.75 7.73608C3.75 6.532 4.4699 5.44459 5.57835 4.97434L10.8284 2.74706C11.5772 2.42939 12.4228 2.42939 13.1716 2.74706L18.4216 4.97434C19.5301 5.44459 20.25 6.532 20.25 7.73608V13C20.25 17.5563 16.5563 21.25 12 21.25C7.44365 21.25 3.75 17.5563 3.75 13V7.73608Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </CentralIconBase>
);

export default IconShield2;
