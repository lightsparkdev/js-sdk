import type { FC } from "react";

import { CentralIconBase, type CentralIconBaseProps } from "./CentralIconBase";

export const IconShieldKeyhole: FC<CentralIconBaseProps> = (props) => (
  <CentralIconBase {...props} ariaLabel="shield-keyhole">
    <path
      d="M12 8.75001C11.1716 8.75001 10.5 9.42159 10.5 10.25C10.5 11.0784 11.1716 11.75 12 11.75C12.8284 11.75 13.5 11.0784 13.5 10.25C13.5 9.42159 12.8284 8.75001 12 8.75001ZM12 8.75001V14.75M20.25 11.9124V6.94153C20.25 6.08067 19.6991 5.31639 18.8825 5.04417L12.9487 3.06624C12.3329 2.86098 11.6671 2.86098 11.0513 3.06624L5.11754 5.04417C4.30086 5.31639 3.75 6.08067 3.75 6.94153V11.9124C3.75 16.8848 8 19.25 12 21.4079C16 19.25 20.25 16.8848 20.25 11.9124Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </CentralIconBase>
);

export default IconShieldKeyhole;
