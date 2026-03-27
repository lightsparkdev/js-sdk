import type { FC } from "react";

import { CentralIconBase, type CentralIconBaseProps } from "./CentralIconBase";

export const IconFormPyramide: FC<CentralIconBaseProps> = (props) => (
  <CentralIconBase {...props} ariaLabel="form-pyramide, prism">
    <path
      d="M2.42919 15.1761L11.1909 3.11386C11.5902 2.56412 12.4098 2.56412 12.8091 3.11386L21.5708 15.1761C21.929 15.6692 21.7665 16.3653 21.2271 16.6489L12.4654 21.2553C12.174 21.4085 11.826 21.4085 11.5346 21.2553L2.77292 16.6489C2.23346 16.3653 2.071 15.6692 2.42919 15.1761Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 4V20.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </CentralIconBase>
);

export default IconFormPyramide;
