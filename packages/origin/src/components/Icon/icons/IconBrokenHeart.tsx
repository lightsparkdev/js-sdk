import type { FC } from "react";

import { CentralIconBase, type CentralIconBaseProps } from "./CentralIconBase";

export const IconBrokenHeart: FC<CentralIconBaseProps> = (props) => (
  <CentralIconBase {...props} ariaLabel="broken-heart, delete-account">
    <path
      d="M12 5.57193C18.3331 -0.86765 29.1898 11.0916 12 20.75C-5.18982 11.0916 5.66687 -0.867651 12 5.57193ZM12 5.57193C11.1207 6.53558 10.4876 7.78832 10 8.99993L13 11.9999L12 14.9999"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </CentralIconBase>
);

export default IconBrokenHeart;
