import type { FC } from "react";

import { CentralIconBase, type CentralIconBaseProps } from "./CentralIconBase";

export const IconSquareArrowTopRight2: FC<CentralIconBaseProps> = (props) => (
  <CentralIconBase
    {...props}
    ariaLabel="square-arrow-top-right-2, open, new, link, open link, box, arrow"
  >
    <path
      d="M9.25 3.75H8.55C6.86984 3.75 6.02976 3.75 5.38803 4.07698C4.82354 4.3646 4.3646 4.82354 4.07698 5.38803C3.75 6.02976 3.75 6.86984 3.75 8.55V15.45C3.75 17.1302 3.75 17.9702 4.07698 18.612C4.3646 19.1765 4.82354 19.6354 5.38803 19.923C6.02976 20.25 6.86984 20.25 8.55 20.25H15.45C17.1302 20.25 17.9702 20.25 18.612 19.923C19.1765 19.6354 19.6354 19.1765 19.923 18.612C20.25 17.9702 20.25 17.1302 20.25 15.45V14.75"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M13.75 3.75H20.25M20.25 3.75V10.25M20.25 3.75L11 13"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </CentralIconBase>
);

export default IconSquareArrowTopRight2;
