import type { FC } from "react";

import { CentralIconBase, type CentralIconBaseProps } from "./CentralIconBase";

export const IconTrashRounded: FC<CentralIconBaseProps> = (props) => (
  <CentralIconBase {...props} ariaLabel="trash-rounded, delete, remove">
    <path
      d="M20.25 5.5C20.25 6.88071 16.5563 8 12 8C7.44365 8 3.75 6.88071 3.75 5.5C3.75 4.11929 7.44365 3 12 3C16.5563 3 20.25 4.11929 20.25 5.5Z"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M3.75 5.5L4.99636 14.8666C5.22121 16.5564 5.33363 17.4012 5.64516 18.0816C6.23984 19.3804 7.36162 20.3628 8.72748 20.7809C9.44297 21 10.2953 21 12 21C13.7047 21 14.557 21 15.2725 20.7809C16.6384 20.3628 17.7602 19.3804 18.3548 18.0816C18.6664 17.4012 18.7788 16.5564 19.0036 14.8666L20.25 5.5"
      stroke="currentColor"
      strokeWidth="1.5"
    />
  </CentralIconBase>
);

export default IconTrashRounded;
