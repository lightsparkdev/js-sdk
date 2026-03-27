import type { FC } from "react";

import { CentralIconBase, type CentralIconBaseProps } from "./CentralIconBase";

export const IconThumbUpCurved: FC<CentralIconBaseProps> = (props) => (
  <CentralIconBase {...props} ariaLabel="thumb-up-curved">
    <path
      d="M12.413 2.80853L11.9418 2.75C10.5 7.5 7.75 8.46342 7.75 11.2837V17.945C7.75 18.7474 8.21423 19.489 8.97294 19.7636C11.5477 20.6953 14.2409 20.8946 16.9636 20.6601C18.6263 20.5169 19.9292 19.2409 20.2956 17.6228L21.1727 13.7486C21.6109 11.8131 20.1299 9.97331 18.1336 9.97331H13.5185L14.5039 6.79075C15.0734 4.95159 14.3343 3.0472 12.413 2.80853Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <path
      d="M2.75 11.75C2.75 10.6454 3.64543 9.75 4.75 9.75C6.40685 9.75 7.75 11.0931 7.75 12.75V17.25C7.75 18.9069 6.40685 20.25 4.75 20.25C3.64543 20.25 2.75 19.3546 2.75 18.25V11.75Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </CentralIconBase>
);

export default IconThumbUpCurved;
