import type { FC } from "react";

import { CentralIconBase, type CentralIconBaseProps } from "./CentralIconBase";

export const IconHeart2: FC<CentralIconBaseProps> = (props) => (
  <CentralIconBase {...props} ariaLabel="heart-2, like, health, life, fav">
    <path
      d="M12 5.57193C18.3331 -0.86765 29.1898 11.0916 12 20.75C-5.18982 11.0916 5.66687 -0.867651 12 5.57193Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </CentralIconBase>
);

export default IconHeart2;
