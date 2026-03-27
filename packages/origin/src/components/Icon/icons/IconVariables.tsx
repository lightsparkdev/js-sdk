import type { FC } from "react";

import { CentralIconBase, type CentralIconBaseProps } from "./CentralIconBase";

export const IconVariables: FC<CentralIconBaseProps> = (props) => (
  <CentralIconBase {...props} ariaLabel="variables, figma">
    <path
      d="M10.5 3.36603C11.4282 2.83013 12.5718 2.83013 13.5 3.36603L18.7272 6.38397C19.6554 6.91987 20.2272 7.91025 20.2272 8.98205V15.0179C20.2272 16.0897 19.6554 17.0801 18.7272 17.616L13.5 20.634C12.5718 21.1699 11.4282 21.1699 10.5 20.634L5.27276 17.616C4.34456 17.0801 3.77276 16.0897 3.77276 15.0179V8.98205C3.77276 7.91025 4.34456 6.91987 5.27276 6.38397L10.5 3.36603Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M11.25 12H12.75M13.5 12C13.5 12.8284 12.8284 13.5 12 13.5C11.1716 13.5 10.5 12.8284 10.5 12C10.5 11.1716 11.1716 10.5 12 10.5C12.8284 10.5 13.5 11.1716 13.5 12Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </CentralIconBase>
);

export default IconVariables;
