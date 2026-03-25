import type { FC } from "react";

import { CentralIconBase, type CentralIconBaseProps } from "./CentralIconBase";

export const IconImport2: FC<CentralIconBaseProps> = (props) => (
  <CentralIconBase {...props} ariaLabel="import-2, download, save">
    <path
      d="M21.25 8.75V16.25C21.25 17.9069 19.9069 19.25 18.25 19.25H5.75C4.09315 19.25 2.75 17.9069 2.75 16.25V7.75C2.75 6.09315 4.09315 4.75 5.75 4.75H8.25"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M21.25 4.75H17C14.2386 4.75 12 6.98858 12 9.75V15M12 15L8.25 11.25M12 15L15.75 11.25"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </CentralIconBase>
);

export default IconImport2;
