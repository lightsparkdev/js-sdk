import type { FC } from "react";

import { CentralIconBase, type CentralIconBaseProps } from "./CentralIconBase";

export const IconPaperclip1: FC<CentralIconBaseProps> = (props) => (
  <CentralIconBase {...props} ariaLabel="paperclip-1, attachment">
    <path
      d="M5.75 10.75V15.25C5.75 18.5637 8.43629 21.25 11.75 21.25H12.25C15.5637 21.25 18.25 18.5637 18.25 15.25V7C18.25 4.65279 16.3472 2.75 14 2.75C11.6528 2.75 9.75 4.65279 9.75 7V14.875C9.75 16.0486 10.7014 17 11.875 17C13.0486 17 14 16.0486 14 14.875V7.75"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </CentralIconBase>
);

export default IconPaperclip1;
