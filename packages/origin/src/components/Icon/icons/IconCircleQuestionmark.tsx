import type { FC } from "react";

import { CentralIconBase, type CentralIconBaseProps } from "./CentralIconBase";

export const IconCircleQuestionmark: FC<CentralIconBaseProps> = (props) => (
  <CentralIconBase
    {...props}
    ariaLabel="circle-questionmark, faq, help, questionaire"
  >
    <path
      d="M12 21.25C17.1086 21.25 21.25 17.1086 21.25 12C21.25 6.89137 17.1086 2.75 12 2.75C6.89137 2.75 2.75 6.89137 2.75 12C2.75 17.1086 6.89137 21.25 12 21.25Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 16V15.99M12.25 16C12.25 16.1381 12.1381 16.25 12 16.25C11.8619 16.25 11.75 16.1381 11.75 16C11.75 15.8619 11.8619 15.75 12 15.75C12.1381 15.75 12.25 15.8619 12.25 16Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9.75 9.25001C10.5 7.00001 14.25 7.19157 14.25 9.54133C14.25 11.2008 12 11.4614 12 13.25"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </CentralIconBase>
);

export default IconCircleQuestionmark;
