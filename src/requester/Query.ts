type Query<T> = {
  /** The string representation of the query payload for graphQL. **/
  queryPayload: string;

  /** The variables that will be passed to the query. **/
  variables?: { [key: string]: any };

  /** The function that will be called to construct the object from the response. **/
  constructObject: (rawData: any) => T;
};

export default Query;
