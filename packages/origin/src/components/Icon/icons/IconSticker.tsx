import type { FC } from "react";

import { CentralIconBase, type CentralIconBaseProps } from "./CentralIconBase";

export const IconSticker: FC<CentralIconBaseProps> = (props) => (
  <CentralIconBase {...props} ariaLabel="sticker, badge">
    <path
      d="M12 21.25C17.1086 21.25 21.25 17.1086 21.25 12C21.25 11.3334 20.9367 10.7154 20.4653 10.244L13.756 3.53467C13.2846 3.0633 12.6666 2.75 12 2.75C6.89137 2.75 2.75 6.89137 2.75 12C2.75 17.1086 6.89137 21.25 12 21.25Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <path
      d="M13.0416 3C12.4995 7.5 16.4993 11.5 20.9995 10.9578"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M14 5.5L18.5 10"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="square"
    />
  </CentralIconBase>
);

export default IconSticker;
