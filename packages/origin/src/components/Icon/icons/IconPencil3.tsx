import type { FC } from "react";

import { CentralIconBase, type CentralIconBaseProps } from "./CentralIconBase";

export const IconPencil3: FC<CentralIconBaseProps> = (props) => (
  <CentralIconBase {...props} ariaLabel="pencil-3, edit, write, prompt">
    <path
      d="M15.0294 3.82353L4.95922 13.8937C4.51709 14.3359 4.22415 14.9051 4.12136 15.5218L3.25 20.75L8.47816 19.8786C9.09492 19.7758 9.66415 19.4829 10.1063 19.0408L20.1765 8.97059C21.5978 7.54927 21.5978 5.24485 20.1765 3.82353C18.7552 2.40221 16.4507 2.40221 15.0294 3.82353Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M17.5 6.5L14.5 9.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </CentralIconBase>
);

export default IconPencil3;
