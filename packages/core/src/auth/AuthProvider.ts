// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

export default interface AuthProvider {
  addAuthHeaders(headers: any): Promise<any>;
  isAuthorized(): Promise<boolean>;
  addWsConnectionParams(params: any): Promise<any>;
}
