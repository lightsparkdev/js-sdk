import type { FC } from "react";

import { CentralIconBase, type CentralIconBaseProps } from "./CentralIconBase";

export const IconFullScreen: FC<CentralIconBaseProps> = (props) => (
  <CentralIconBase {...props} ariaLabel="full-screen, focus">
    <path
      d="M8.25 3.75H6.75C5.09315 3.75 3.75 5.09315 3.75 6.75V8.25M15.75 3.75H17.25C18.9069 3.75 20.25 5.09315 20.25 6.75V8.25M20.25 15.75V17.25C20.25 18.9069 18.9069 20.25 17.25 20.25H15.75M8.25 20.25H6.75C5.09315 20.25 3.75 18.9069 3.75 17.25V15.75"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </CentralIconBase>
);

export default IconFullScreen;
