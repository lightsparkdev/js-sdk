import type { FC } from "react";

import { CentralIconBase, type CentralIconBaseProps } from "./CentralIconBase";

export const IconHeart2Filled: FC<CentralIconBaseProps> = (props) => (
  <CentralIconBase {...props} ariaLabel="heart-2, like, health, life, fav">
    <path
      d="M12.367 21.404C21.0867 16.5047 23.0858 10.7671 21.517 6.84578C20.7498 4.92821 19.1421 3.55922 17.2522 3.1368C15.5338 2.75271 13.6394 3.16312 11.9995 4.54956C10.3596 3.16312 8.46525 2.75271 6.74682 3.13681C4.85695 3.55922 3.24924 4.92822 2.48209 6.8458C0.913293 10.7672 2.91243 16.5047 11.6322 21.404C11.8603 21.5322 12.1388 21.5322 12.367 21.404Z"
      fill="currentColor"
    />
  </CentralIconBase>
);

export default IconHeart2Filled;
