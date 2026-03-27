import type { FC } from "react";

import { CentralIconBase, type CentralIconBaseProps } from "./CentralIconBase";

export const IconUserGroup: FC<CentralIconBaseProps> = (props) => (
  <CentralIconBase
    {...props}
    ariaLabel="user-group, team, club, member, friends, community"
  >
    <circle
      cx="12"
      cy="8.75"
      r="3"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle
      cx="4"
      cy="9.80005"
      r="2"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle
      cx="20"
      cy="9.80005"
      r="2"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M11.5833 11.75H12.4167C14.8099 11.75 16.75 13.6901 16.75 16.0833C16.75 17.28 15.78 18.25 14.5833 18.25H9.41667C8.22005 18.25 7.25 17.28 7.25 16.0833C7.25 13.6901 9.1901 11.75 11.5833 11.75Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4.25 17.2602H3.75C2.09315 17.2602 0.602599 15.8581 1.18922 14.3086C1.64924 13.0935 2.51652 12.2276 4 11.8301"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M19.75 17.2601H20.25C21.9069 17.2601 23.3974 15.8581 22.8108 14.3085C22.3507 13.0934 21.4835 12.2276 20 11.8301"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </CentralIconBase>
);

export default IconUserGroup;
