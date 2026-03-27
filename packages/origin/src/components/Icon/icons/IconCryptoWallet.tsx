import type { FC } from "react";

import { CentralIconBase, type CentralIconBaseProps } from "./CentralIconBase";

export const IconCryptoWallet: FC<CentralIconBaseProps> = (props) => (
  <CentralIconBase {...props} ariaLabel="crypto-wallet">
    <path
      d="M3.75 6.5V6.5C3.75 4.98122 4.98122 3.75 6.5 3.75H14.1667C15.3173 3.75 16.25 4.68274 16.25 5.83333V8.75M3.75 6.5V6.5C3.75 7.74264 4.75736 8.75 6 8.75H16.25M3.75 6.5V11.25M16.25 8.75H17.25C18.9069 8.75 20.25 10.0931 20.25 11.75V17.25C20.25 18.9069 18.9069 20.25 17.25 20.25H12.25"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6 13.4583L9.25 15.3541V19.1458L6 21.0416L2.75 19.1458V15.3541L6 13.4583Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M15.5 14.5V14.49M15.75 14.5C15.75 14.6381 15.6381 14.75 15.5 14.75C15.3619 14.75 15.25 14.6381 15.25 14.5C15.25 14.3619 15.3619 14.25 15.5 14.25C15.6381 14.25 15.75 14.3619 15.75 14.5Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </CentralIconBase>
);

export default IconCryptoWallet;
