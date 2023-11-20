// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

type Query<T> = {
  /** The string representation of the query payload for graphQL. **/
  queryPayload: string;

  /** The variables that will be passed to the query. **/
  variables?: { [key: string]: unknown };

  /**
   * The function that will be called to construct the object from the
   * response. *
   */
  constructObject: (rawData: any) => T; // eslint-disable-line @typescript-eslint/no-explicit-any -- LIG-3400

  /** The id of the node that will be used to sign the query. **/
  signingNodeId?: string;

  /** True if auth headers should be omitted for this query. **/
  skipAuth?: boolean;
};

export default Query;
