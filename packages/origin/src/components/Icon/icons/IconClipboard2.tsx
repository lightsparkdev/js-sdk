import type { FC } from "react";

import { CentralIconBase, type CentralIconBaseProps } from "./CentralIconBase";

export const IconClipboard2: FC<CentralIconBaseProps> = (props) => (
  <CentralIconBase {...props} ariaLabel="clipboard-2, copy, list">
    <path
      d="M16.25 4.75H17.25C18.9069 4.75 20.25 6.09315 20.25 7.75V18.25C20.25 19.9069 18.9069 21.25 17.25 21.25H6.75C5.09315 21.25 3.75 19.9069 3.75 18.25V7.75C3.75 6.09315 5.09315 4.75 6.75 4.75H7.75M8.75 7.25H15.25C15.8023 7.25 16.25 6.80228 16.25 6.25V5.75C16.25 4.09315 14.9069 2.75 13.25 2.75H10.75C9.09315 2.75 7.75 4.09315 7.75 5.75V6.25C7.75 6.80228 8.19772 7.25 8.75 7.25Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="square"
      strokeLinejoin="round"
    />
  </CentralIconBase>
);

export default IconClipboard2;
